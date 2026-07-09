import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { findGooglePlace } from '@/lib/googlePlace'
import { getDailyUsage, recordUsage } from '@/lib/apiUsage'

// ============================================================================
// ⚠️⚠️⚠️ STAYLO ÇEKİRDEĞİ — TAKLİT EDİLEMEZ KISIM ⚠️⚠️⚠️
// Gemini skorlama prompt'u + tüm ağırlık/skor mantığı SADECE server'da
// ('server-only' garantisi) — asla tarayıcıya inmez. Kopyalanma koruması.
//
// Birikimli yorum havuzu: Google/Tripadvisor geçmişe toplu erişim vermiyor,
// bu yüzden her tazelemede en yeni yorumlar hotel_reviews'e UPSERT edilir
// (çakışan atlanır) ve havuz ZAMANLA büyür. Skorlama snapshot değil, birikmiş
// havuzun tamamını kullanır → skor kalitesi kendiliğinden artar.
// ============================================================================

const FETCH_TIMEOUT_MS = 10_000
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const GOOGLE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'
const TRIPADVISOR_BASE_URL = 'https://terra.tripadvisor.com/api'

// Gemini'ye gönderilen havuz üst sınırı (token maliyeti için) — dağılım
// istatistikleri her zaman TÜM havuzdan hesaplanır, sadece metin gövdesi sınırlı.
const MAX_CORPUS_REVIEWS = 60

// Yeterli veri eşiği — SADECE iç skorlama kalitesi için (kullanıcıya "az veri"
// etiketi GÖSTERİLMEZ; güvenilirliği zedeler, kararı kullanıcıya bırakırız).
const MIN_TOTAL_REVIEWS = 10

// ⚠️ Günlük kod tarafı maliyet tavanları (bkz. apiUsage.ts). Eşik dolunca o
// kaynak o gün atlanır, otel diğer kaynaktan + birikmiş havuzdan skorlanır.
// Terra: entity bazlı (~$0.015/entity → ~130 = ~$2/gün). Otel başına ~2 entity.
// Google: çağrı bazlı yumuşak fren (Cloud'daki 5.000 sert quota'dan önce).
const TERRA_DAILY_CAP = 130
const GOOGLE_DAILY_CAP = 2000

// Skorlanan kriterler. İlk 6 = kullanıcı weight anahtarlarıyla birebir aynı →
// ağırlıklı toplam bunlar üzerinden. 'staff' skorlanır ama henüz weight'i yok.
const WEIGHTED_CRITERIA = ['safety', 'quiet', 'family', 'value', 'walkability', 'cleanliness'] as const
const SCORE_CRITERIA = [...WEIGHTED_CRITERIA, 'staff'] as const
type ScoreCriterion = (typeof SCORE_CRITERIA)[number]

// ---- Aggregate (rating + toplam sayı) — hotel_analysis'te tutulur ----------
export type GoogleData = { placeId: string; rating: number | null; reviewCount: number | null }
export type TripadvisorData = { locationId: string; rating: number | null; reviewCount: number | null }

// ---- Ham yorum — hotel_reviews havuzuna yazılır ----------------------------
type RawReview = {
  source: 'google' | 'tripadvisor'
  reviewKey: string
  rating: number | null
  text: string | null
  date: string | null // ISO
}

export type ReviewDistribution = { total: number; positive: number; negative: number; neutral: number }

// Gemini çıktısı + iç metadata (dağılım, havuz boyutu — kullanıcıya inmez).
export type GeminiScores = {
  scores: Partial<Record<ScoreCriterion, number>>
  summary: string | null
  distribution: ReviewDistribution
  poolSize: number
}

export type HotelAnalysisData = {
  google: GoogleData | null
  tripadvisor: TripadvisorData | null
  geminiScores: GeminiScores | null
  totalReviewCount: number
  poolSize: number
  lowConfidence: boolean // iç kullanım — UI'da gösterilmez
}

export type WeightedResult = { total: number | null; lowConfidence: boolean }

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

// ----------------------------------------------------------------------------
// Google Place Details. most_relevant(5) + newest(5) İKİ çağrı → çakışmasız ~10
// yorum (kanıtlandı). newest doğal olarak yeni şikayetleri (düşük puan) yakalar,
// dengeli havuz sağlar (Google'da rating filtresi YOK). review_key = author_url|time.
// ----------------------------------------------------------------------------
async function fetchGoogleDetails(
  placeId: string,
  serverKey: string,
  sort?: 'newest'
): Promise<{ rating: number | null; count: number | null; reviews: RawReview[] }> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'rating,user_ratings_total,reviews',
    key: serverKey,
  })
  if (sort) params.set('reviews_sort', sort)
  const res = await fetchWithTimeout(`${GOOGLE_DETAILS_URL}?${params.toString()}`)
  if (!res.ok) throw new Error(`Google place details responded ${res.status}`)
  const data = await res.json()
  if (data.status !== 'OK') throw new Error(`Google place details status: ${data.status}`)
  const result = data.result ?? {}
  const reviews: RawReview[] = Array.isArray(result.reviews)
    ? result.reviews
        .filter((r: any) => r.author_url && r.time)
        .map((r: any) => ({
          source: 'google' as const,
          reviewKey: `${r.author_url}|${r.time}`,
          rating: typeof r.rating === 'number' ? r.rating : null,
          text: r.text ?? null,
          date: typeof r.time === 'number' ? new Date(r.time * 1000).toISOString() : null,
        }))
    : []
  return {
    rating: typeof result.rating === 'number' ? result.rating : null,
    count: typeof result.user_ratings_total === 'number' ? result.user_ratings_total : null,
    reviews,
  }
}

async function fetchGoogle(
  name: string,
  address: string | null
): Promise<{ aggregate: GoogleData | null; reviews: RawReview[]; calls: number }> {
  const serverKey = process.env.GOOGLE_PLACES_SERVER_KEY
  if (!serverKey) return { aggregate: null, reviews: [], calls: 0 }

  const place = await findGooglePlace(name, address) // 1 find çağrısı (memo-hit olabilir)
  if (!place) return { aggregate: null, reviews: [], calls: 1 }

  const [relevant, newest] = await Promise.all([
    fetchGoogleDetails(place.placeId, serverKey),
    fetchGoogleDetails(place.placeId, serverKey, 'newest').catch((e) => {
      console.error('Google newest reviews failed:', e instanceof Error ? e.message : e)
      return { rating: null, count: null, reviews: [] as RawReview[] }
    }),
  ])

  // İki çağrıyı review_key ile tekilleştir (bu çağrı içinde; kalıcı dedup DB PK'da).
  const byKey = new Map<string, RawReview>()
  for (const r of [...relevant.reviews, ...newest.reviews]) byKey.set(r.reviewKey, r)

  return {
    aggregate: { placeId: place.placeId, rating: relevant.rating, reviewCount: relevant.count },
    reviews: Array.from(byKey.values()),
    calls: 3, // 1 find + 2 details (relevant + newest)
  }
}

// ----------------------------------------------------------------------------
// Tripadvisor Terra: Catalog Search (size=1, allowlist'siz) → location_id +
// overall_rating. Sonra reviews (Discover'da 2-3 mevcut). review_key = yorum id.
// ----------------------------------------------------------------------------
async function fetchTripadvisor(
  name: string,
  countryCode: string | null
): Promise<{ aggregate: TripadvisorData | null; reviews: RawReview[]; entities: number }> {
  const apiKey = process.env.TRIPADVISOR_API_KEY
  if (!apiKey) return { aggregate: null, reviews: [], entities: 0 }

  // size=1: billable entity dönen HER location ID başına sayılıyor — ilk aday yeter.
  const searchParams = new URLSearchParams({ query: name, category: 'HOTEL', size: '1' })
  if (countryCode) searchParams.set('country_code', countryCode)

  const searchRes = await fetchWithTimeout(
    `${TRIPADVISOR_BASE_URL}/catalog/locations/search?${searchParams.toString()}`,
    { headers: { 'X-API-Key': apiKey } }
  )
  if (!searchRes.ok) throw new Error(`Tripadvisor catalog search responded ${searchRes.status}`)
  const searchData = await searchRes.json()
  const location = searchData.data?.[0]?.location
  // Eşleşme yoksa 0 location döndü → 0 billable entity.
  if (!location?.id) return { aggregate: null, reviews: [], entities: 0 }

  const locationId = String(location.id)
  const overall = location.overall_rating ?? {}

  let reviews: RawReview[] = []
  try {
    const reviewsRes = await fetchWithTimeout(`${TRIPADVISOR_BASE_URL}/locations/${locationId}/reviews?size=5`, {
      headers: { 'X-API-Key': apiKey },
    })
    if (reviewsRes.ok) {
      const rd = await reviewsRes.json()
      reviews = (Array.isArray(rd.data) ? rd.data : [])
        .filter((r: any) => r.id != null)
        .map((r: any) => ({
          source: 'tripadvisor' as const,
          reviewKey: String(r.id),
          rating: typeof r.rating === 'number' ? r.rating : null,
          text: [r.title?.[0]?.value, r.text?.[0]?.value].filter(Boolean).join(' — ') || null,
          date: r.publish_ts ?? null,
        }))
    } else {
      console.error('Tripadvisor reviews responded', reviewsRes.status, 'for', locationId)
    }
  } catch (err) {
    console.error('Tripadvisor reviews fetch failed:', err instanceof Error ? err.message : err)
  }

  return {
    aggregate: {
      locationId,
      rating: typeof overall.rating === 'number' ? overall.rating : null,
      reviewCount: typeof overall.count === 'number' ? overall.count : null,
    },
    reviews,
    entities: 2, // 1 catalog search (1 location döndü) + 1 reviews çağrısı
  }
}

// ----------------------------------------------------------------------------
// Havuz (hotel_reviews) — UPSERT (çakışan review_key atlanır) + oku.
// ----------------------------------------------------------------------------
async function upsertReviewPool(hotelId: string, reviews: RawReview[]): Promise<void> {
  if (reviews.length === 0) return
  const rows = reviews.map((r) => ({
    source: r.source,
    review_key: r.reviewKey,
    hotel_id: hotelId,
    rating: r.rating,
    text: r.text,
    review_date: r.date,
  }))
  // ignoreDuplicates: mevcut yorumu (ve gelecekte dolacak sentiment'i) ezme.
  const { error } = await supabaseAdmin
    .from('hotel_reviews')
    .upsert(rows, { onConflict: 'source,review_key', ignoreDuplicates: true })
  if (error) console.error('hotel_reviews upsert error:', error.message)
}

type PoolReview = { source: string; rating: number | null; text: string | null; date: string | null }

async function readReviewPool(hotelId: string): Promise<PoolReview[]> {
  const { data, error } = await supabaseAdmin
    .from('hotel_reviews')
    .select('source, rating, text, review_date')
    .eq('hotel_id', hotelId)
    .order('review_date', { ascending: false, nullsFirst: false })
  if (error) {
    console.error('hotel_reviews read error:', error.message)
    return []
  }
  return (data ?? []).map((r) => ({ source: r.source, rating: r.rating, text: r.text, date: r.review_date }))
}

// Puan bazlı dağılım (>=4 olumlu, <=2 olumsuz, ==3 nötr). Objektif, Gemini'siz.
function computeDistribution(pool: PoolReview[]): ReviewDistribution {
  let positive = 0
  let negative = 0
  let neutral = 0
  for (const r of pool) {
    if (r.rating == null) continue
    if (r.rating >= 4) positive++
    else if (r.rating <= 2) negative++
    else neutral++
  }
  return { total: pool.length, positive, negative, neutral }
}

// ----------------------------------------------------------------------------
// ⚠️ ÇEKİRDEK: Gemini yorum analizi — birikmiş havuzun tamamı + dağılım.
// ----------------------------------------------------------------------------
function buildCorpus(pool: PoolReview[]): string {
  const lines: string[] = []
  for (const r of pool.slice(0, MAX_CORPUS_REVIEWS)) {
    if (!r.text) continue
    const src = r.source === 'google' ? 'G' : 'T'
    lines.push(`[${src} ${r.rating ?? '?'}/5] ${r.text.slice(0, 600)}`)
  }
  return lines.join('\n')
}

async function computeGeminiScores(pool: PoolReview[], dist: ReviewDistribution): Promise<GeminiScores | null> {
  const corpus = buildCorpus(pool)
  if (!corpus.trim()) return null

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const prompt = `You are a hotel review analyst. Based ONLY on the guest reviews below, score this hotel on each criterion from 0 to 10 (10 = excellent). Weigh the full set; do not let a single outlier dominate. If a criterion has no signal, score near the middle. Return ONLY valid JSON, no markdown.

Review distribution (for calibration): ${dist.total} reviews analyzed — ${dist.positive} positive, ${dist.negative} negative, ${dist.neutral} neutral.

Criteria:
- safety: how safe guests feel (neighbourhood, at night, security)
- quiet: quietness / absence of noise complaints
- family: suitability for families (kids, space, family amenities)
- value: value for money (price vs. quality)
- walkability: location quality — proximity to centre, transit, walkable surroundings
- cleanliness: cleanliness / housekeeping
- staff: staff helpfulness and service quality

Reviews:
${corpus}

Return exactly:
{"safety":0-10,"quiet":0-10,"family":0-10,"value":0-10,"walkability":0-10,"cleanliness":0-10,"staff":0-10,"summary":"one short sentence (max 15 words) capturing overall guest sentiment"}`

  let text: string
  try {
    const result = await model.generateContent(prompt)
    text = result.response.text()
  } catch (err: any) {
    console.error('Gemini scoring error:', err?.message || err)
    return null
  }

  let parsed: any
  try {
    parsed = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
  } catch {
    console.error('Gemini scoring: JSON parse failed')
    return null
  }

  const scores: Partial<Record<ScoreCriterion, number>> = {}
  for (const k of SCORE_CRITERIA) {
    const v = Number(parsed?.[k])
    if (Number.isFinite(v)) scores[k] = Math.max(0, Math.min(10, v))
  }
  if (Object.keys(scores).length === 0) return null

  return {
    scores,
    summary: typeof parsed?.summary === 'string' ? parsed.summary : null,
    distribution: dist,
    poolSize: pool.length,
  }
}

// ----------------------------------------------------------------------------
// Değişken TTL: popüler otel (yorum akışı yüksek) sık, sakin otel seyrek tazelenir.
// Kota tasarrufu + long-tail otellerde gereksiz Gemini/API çağrısını önler.
// ----------------------------------------------------------------------------
function ttlForTotal(totalReviewCount: number): number {
  if (totalReviewCount > 5000) return 24 * 60 * 60_000 // 1 gün
  if (totalReviewCount >= 1000) return 3 * 24 * 60 * 60_000 // 3 gün
  return 7 * 24 * 60 * 60_000 // 7 gün
}

function total(google: GoogleData | null, tripadvisor: TripadvisorData | null): number {
  return (google?.reviewCount ?? 0) + (tripadvisor?.reviewCount ?? 0)
}

// ----------------------------------------------------------------------------
// Orkestrasyon: TTL taze ise cache; bayat ise → yeni yorumları çek + havuza
// UPSERT (biriktir) → TÜM havuzu oku → Gemini skorla → aggregate + skor yaz.
// ----------------------------------------------------------------------------
export async function getHotelAnalysis(
  hotelId: string,
  name: string,
  address: string | null,
  countryCode: string | null
): Promise<HotelAnalysisData> {
  const now = Date.now()

  const { data: row, error } = await supabaseAdmin
    .from('hotel_analysis')
    .select('google_data, tripadvisor_data, gemini_scores, created_at')
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) console.error('hotel_analysis select error:', error.message)

  const pack = (
    google: GoogleData | null,
    tripadvisor: TripadvisorData | null,
    geminiScores: GeminiScores | null
  ): HotelAnalysisData => {
    const t = total(google, tripadvisor)
    return {
      google,
      tripadvisor,
      geminiScores,
      totalReviewCount: t,
      poolSize: geminiScores?.poolSize ?? 0,
      lowConfidence: t < MIN_TOTAL_REVIEWS,
    }
  }

  const prevGoogle = (row?.google_data as GoogleData | null) ?? null
  const prevTa = (row?.tripadvisor_data as TripadvisorData | null) ?? null
  const prevScores = (row?.gemini_scores as GeminiScores | null) ?? null

  const ttl = ttlForTotal(total(prevGoogle, prevTa))
  const isFresh = !!row && now - new Date(row.created_at).getTime() < ttl && !!prevScores
  if (isFresh) return pack(prevGoogle, prevTa, prevScores)

  // Bayat/eksik → yeni yorumları çek. Önce günlük maliyet tavanını kontrol et;
  // dolu olan kaynak atlanır (fail-safe — diğer kaynak + havuz yine skorlar).
  const [googleUsage, terraUsage] = await Promise.all([getDailyUsage('google'), getDailyUsage('tripadvisor')])
  const googleAllowed = googleUsage < GOOGLE_DAILY_CAP
  const terraAllowed = terraUsage < TERRA_DAILY_CAP
  if (!googleAllowed) console.error(`[BUDGET] google günlük tavan dolu (${googleUsage}/${GOOGLE_DAILY_CAP}) — atlanıyor`)
  if (!terraAllowed) console.error(`[BUDGET] tripadvisor günlük tavan dolu (${terraUsage}/${TERRA_DAILY_CAP}) — atlanıyor`)

  const [gRes, tRes] = await Promise.allSettled([
    googleAllowed ? fetchGoogle(name, address) : Promise.resolve(null),
    terraAllowed ? fetchTripadvisor(name, countryCode) : Promise.resolve(null),
  ])
  const gOut = gRes.status === 'fulfilled' ? gRes.value : (console.error('Google fetch failed:', gRes.reason), null)
  const tOut = tRes.status === 'fulfilled' ? tRes.value : (console.error('Tripadvisor fetch failed:', tRes.reason), null)

  // Gerçekte tüketilen birimleri kaydet (başarısız/atlanan = 0).
  if (gOut && gOut.calls > 0) await recordUsage('google', gOut.calls, GOOGLE_DAILY_CAP)
  if (tOut && tOut.entities > 0) await recordUsage('tripadvisor', tOut.entities, TERRA_DAILY_CAP)

  // Aggregate: bu çağrı başarısızsa önceki değeri koru (totalReviewCount stabil kalsın)
  const google = gOut?.aggregate ?? prevGoogle
  const tripadvisor = tOut?.aggregate ?? prevTa

  // Havuza biriktir (çakışan atlanır)
  const fetched = [...(gOut?.reviews ?? []), ...(tOut?.reviews ?? [])]
  await upsertReviewPool(hotelId, fetched)

  // TÜM birikmiş havuzu oku → skorla
  const pool = await readReviewPool(hotelId)
  if (pool.length === 0) return pack(google, tripadvisor, prevScores) // hiç yorum yok, yazma

  const dist = computeDistribution(pool)
  const geminiScores = (await computeGeminiScores(pool, dist)) ?? prevScores

  supabaseAdmin
    .from('hotel_analysis')
    .upsert({
      hotel_id: hotelId,
      google_data: google,
      tripadvisor_data: tripadvisor,
      gemini_scores: geminiScores,
      created_at: new Date(now).toISOString(),
    })
    .then(({ error: e }) => {
      if (e) console.error('hotel_analysis upsert error:', e.message)
    })

  return pack(google, tripadvisor, geminiScores)
}

// ----------------------------------------------------------------------------
// ⚠️ ÇEKİRDEK: Kullanıcı ağırlıklarıyla ağırlıklı toplam skor (0-10). Skoru
// olmayan kriter atlanıp ağırlıklar yeniden normalize edilir. Server-only.
// ----------------------------------------------------------------------------
export function computeWeightedScore(
  analysis: HotelAnalysisData,
  weights: Record<string, number>
): WeightedResult {
  const scores = analysis.geminiScores?.scores
  if (!scores) return { total: null, lowConfidence: analysis.lowConfidence }

  let weightedSum = 0
  let weightTotal = 0
  for (const k of WEIGHTED_CRITERIA) {
    const s = scores[k]
    const w = Number(weights?.[k])
    if (Number.isFinite(s) && Number.isFinite(w) && w > 0) {
      weightedSum += (s as number) * w
      weightTotal += w
    }
  }
  if (weightTotal === 0) return { total: null, lowConfidence: analysis.lowConfidence }
  return { total: weightedSum / weightTotal, lowConfidence: analysis.lowConfidence }
}
