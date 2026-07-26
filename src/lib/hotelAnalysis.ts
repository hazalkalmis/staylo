import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { findGooglePlace } from '@/lib/googlePlace'
import { getDailyUsage, recordUsage, GEMINI_DAILY_CAP } from '@/lib/apiUsage'
import {
  type GeminiScores,
  type SignalAgg,
  WEIGHTED_CRITERIA,
  emptyAgg,
  decayAgg,
  addBatch,
  deriveScores,
  buildExtractionPrompt,
  parseExtraction,
  getPepper,
  dedupHash,
} from '@/lib/reviewSignals'

// ============================================================================
// ⚠️⚠️⚠️ STAYLO ÇEKİRDEĞİ — TAKLİT EDİLEMEZ KISIM ⚠️⚠️⚠️
// No-store skorlama: ham yorum metni ASLA saklanmaz (Google "kopyala-sakla"
// yasağı). Her tazelemede yeni yorumlar RAM'de çıkarılır (per-kriter + per-
// aspect sentiment), hotel-seviyesi ZAMAN-SÖNÜMLÜ (EMA) toplamlara karışır,
// sonra metin + kimlik atılır. Dedup için sadece server-gizli PEPPER'lı opak
// hash (processed_reviews) tutulur — yorumun kimliği/tarihi HİÇ saklanmaz.
//
// Tüm skorlama mantığı SADECE server'da ('server-only') — asla tarayıcıya inmez.
// ============================================================================

const FETCH_TIMEOUT_MS = 10_000
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const GOOGLE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'

// Yeterli veri eşiği — SADECE iç skorlama kalitesi için (kullanıcıya "az veri"
// etiketi GÖSTERİLMEZ; kararı kullanıcıya bırakırız).
const MIN_TOTAL_REVIEWS = 10

// ⚠️ Günlük kod tarafı maliyet tavanı (bkz. apiUsage.ts). Google: çağrı bazlı
// yumuşak fren (Cloud'daki sert quota'dan önce).
const GOOGLE_DAILY_CAP = 2000

// ---- Aggregate (rating + toplam sayı) — hotel_analysis'te tutulur ----------
export type GoogleData = { placeId: string; rating: number | null; reviewCount: number | null }

// gemini_scores şekli reviewSignals'ten gelir; api/hotels + UI değişmez.
export type { GeminiScores } from '@/lib/reviewSignals'

// ---- Ham yorum — SADECE RAM'de dolaşır, ASLA yazılmaz -----------------------
type RawReview = {
  reviewKey: string // "author_url|time" — sadece dedup hash'i için, saklanmaz
  rating: number | null
  text: string | null
}

export type HotelAnalysisData = {
  google: GoogleData | null
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
// yorum. newest doğal olarak yeni şikayetleri (düşük puan) yakalar, dengeli havuz
// sağlar. review_key = author_url|time (yalnız dedup hash'inde kullanılır).
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
          reviewKey: `${r.author_url}|${r.time}`,
          rating: typeof r.rating === 'number' ? r.rating : null,
          text: r.text ?? null,
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

  // İki çağrıyı review_key ile tekilleştir (bu çağrı içinde; kalıcı dedup hash'te).
  const byKey = new Map<string, RawReview>()
  for (const r of [...relevant.reviews, ...newest.reviews]) byKey.set(r.reviewKey, r)

  return {
    aggregate: { placeId: place.placeId, rating: relevant.rating, reviewCount: relevant.count },
    reviews: Array.from(byKey.values()),
    calls: 3, // 1 find + 2 details (relevant + newest)
  }
}

// ----------------------------------------------------------------------------
// Dedup: fetched yorumların hangileri DAHA ÖNCE işlenmiş? processed_reviews'ta
// opak hash'i olanlar atlanır (double-count önleme). Yeni olanların hash'i döner.
// ----------------------------------------------------------------------------
async function partitionNewReviews(
  hotelId: string,
  reviews: RawReview[],
  pepper: string
): Promise<{ fresh: RawReview[]; freshHashes: string[] }> {
  if (reviews.length === 0) return { fresh: [], freshHashes: [] }
  const hashByKey = new Map<string, string>()
  for (const r of reviews) hashByKey.set(r.reviewKey, dedupHash(pepper, r.reviewKey))
  const allHashes = Array.from(hashByKey.values())

  const { data, error } = await supabaseAdmin
    .from('processed_reviews')
    .select('dedup_hash')
    .eq('hotel_id', hotelId)
    .in('dedup_hash', allHashes)
  if (error) {
    console.error('processed_reviews read error:', error.message)
    // Fail-safe: emin değilsek yeni saymayıp double-count riskini önle.
    return { fresh: [], freshHashes: [] }
  }
  const seen = new Set<string>((data ?? []).map((r) => r.dedup_hash))

  const fresh: RawReview[] = []
  const freshHashes: string[] = []
  for (const r of reviews) {
    const h = hashByKey.get(r.reviewKey)!
    if (seen.has(h)) continue
    fresh.push(r)
    freshHashes.push(h)
  }
  return { fresh, freshHashes }
}

async function markProcessed(hotelId: string, hashes: string[]): Promise<void> {
  if (hashes.length === 0) return
  const rows = hashes.map((h) => ({ hotel_id: hotelId, dedup_hash: h }))
  const { error } = await supabaseAdmin
    .from('processed_reviews')
    .upsert(rows, { onConflict: 'hotel_id,dedup_hash', ignoreDuplicates: true })
  if (error) console.error('processed_reviews insert error:', error.message)
}

// ----------------------------------------------------------------------------
// ⚠️ ÇEKİRDEK: yeni yorumlar üzerinde TEK Gemini çağrısı (temperature:0 + seed)
// → per-yorum kriter/aspect sentiment. Ham metin çağrıdan sonra atılır.
// ----------------------------------------------------------------------------
// called: Gemini'den yanıt ALINDI mı (maliyet oluştu mu). parse başarısız olsa bile
// yanıt geldiyse called=true → çağıran recordUsage sayar + created_at'i sıfırlamaz.
type ExtractResult = { batch: ReturnType<typeof parseExtraction>; called: boolean }

async function extractBatch(reviews: RawReview[], hotelId: string): Promise<ExtractResult> {
  const withText = reviews.filter((r): r is RawReview & { text: string } => !!r.text && r.text.trim().length > 0)
  if (withText.length === 0) return { batch: null, called: false }

  // responseMimeType:'application/json' → model'i geçerli JSON'a zorlar (fence/prose
  // sapması → "JSON parse failed" riskini neredeyse sıfırlar).
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: 'application/json', temperature: 0, seed: 7 } as any,
  })
  const prompt = buildExtractionPrompt(withText.map((r) => ({ rating: r.rating, text: r.text })))

  let text: string
  try {
    const result = await model.generateContent(prompt)
    text = result.response.text()
  } catch (err: any) {
    console.error('extraction error:', err?.message || err)
    return { batch: null, called: false } // API hatası → yanıt yok, maliyet garanti değil
  }
  // Yanıt alındı (billable). parse başarısızsa null döner ama called=true.
  return { batch: parseExtraction(text, withText.map((r) => r.rating), hotelId), called: true }
}

// ----------------------------------------------------------------------------
// Değişken TTL: popüler otel (yorum akışı yüksek) sık, sakin otel seyrek tazelenir.
// ----------------------------------------------------------------------------
function ttlForTotal(totalReviewCount: number): number {
  if (totalReviewCount > 5000) return 24 * 60 * 60_000 // 1 gün
  if (totalReviewCount >= 1000) return 3 * 24 * 60 * 60_000 // 3 gün
  return 7 * 24 * 60 * 60_000 // 7 gün
}

function total(google: GoogleData | null): number {
  return google?.reviewCount ?? 0
}

// ----------------------------------------------------------------------------
// Orkestrasyon: TTL taze ise cache; bayat ise → yeni yorumları çek → dedup →
// SADECE yeni olanları Gemini ile çıkar → EMA aggregate'e karıştır → skoru türet
// → aggregate + skor yaz + hash'leri işaretle. Ham metin asla yazılmaz.
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
    .select('google_data, gemini_scores, signal_agg, created_at')
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) console.error('hotel_analysis select error:', error.message)

  const pack = (
    google: GoogleData | null,
    geminiScores: GeminiScores | null
  ): HotelAnalysisData => {
    const t = total(google)
    return {
      google,
      geminiScores,
      totalReviewCount: t,
      poolSize: geminiScores?.poolSize ?? 0,
      lowConfidence: t < MIN_TOTAL_REVIEWS,
    }
  }

  const prevGoogle = (row?.google_data as GoogleData | null) ?? null
  const prevScores = (row?.gemini_scores as GeminiScores | null) ?? null
  const prevAgg = (row?.signal_agg as SignalAgg | null) ?? null

  const ttl = ttlForTotal(total(prevGoogle))
  const isFresh = !!row && now - new Date(row.created_at).getTime() < ttl && !!prevScores
  if (isFresh) return pack(prevGoogle, prevScores)

  // Bayat/eksik → yeni yorumları çek. Günlük maliyet tavanı kontrolü.
  const [googleUsage, geminiUsage] = await Promise.all([
    getDailyUsage('google'),
    getDailyUsage('gemini'),
  ])
  const googleAllowed = googleUsage < GOOGLE_DAILY_CAP
  const geminiAllowed = geminiUsage < GEMINI_DAILY_CAP
  if (!googleAllowed) console.error(`[BUDGET] google günlük tavan dolu (${googleUsage}/${GOOGLE_DAILY_CAP}) — atlanıyor`)
  if (!geminiAllowed) console.error(`[BUDGET] gemini günlük tavan dolu (${geminiUsage}/${GEMINI_DAILY_CAP}) — skorlama atlanıyor, cache kullanılıyor`)

  const [gRes] = await Promise.allSettled([
    googleAllowed ? fetchGoogle(name, address) : Promise.resolve(null),
  ])
  const gOut = gRes.status === 'fulfilled' ? gRes.value : (console.error('Google fetch failed:', gRes.reason), null)

  if (gOut && gOut.calls > 0) await recordUsage('google', gOut.calls, GOOGLE_DAILY_CAP)

  // Aggregate: bu çağrı başarısızsa önceki değeri koru (totalReviewCount stabil kalsın)
  const google = gOut?.aggregate ?? prevGoogle

  // ---- No-store skorlama akışı --------------------------------------------
  let geminiScores = prevScores
  let aggToWrite: SignalAgg | null = prevAgg
  let extractionFailed = false // yanıt geldi ama parse edilemedi → created_at'i ilerletme

  const pepper = getPepper()
  const fetched = gOut?.reviews ?? []

  if (!pepper) {
    console.error('[CONFIG] REVIEW_DEDUP_PEPPER tanımsız — yeni yorum işlenemez (dedup yapılamaz), cache korunuyor')
  } else if (fetched.length > 0) {
    const { fresh, freshHashes } = await partitionNewReviews(hotelId, fetched, pepper)

    if (fresh.length > 0 && geminiAllowed) {
      const { batch, called } = await extractBatch(fresh, hotelId)
      // Fix 4: yanıt alındıysa (parse başarısız olsa bile) maliyet oluştu → say.
      if (called) await recordUsage('gemini', 1, GEMINI_DAILY_CAP)

      if (batch) {
        // Batch geldiyse: EMA'ya karıştır + processed işaretle HER ZAMAN (aspect-only
        // batch'te skor türemese bile arka plan verisi birikir, yorumlar çift işlenmez).
        const agg = prevAgg ? { ...prevAgg } : emptyAgg()
        decayAgg(agg, now)
        addBatch(agg, batch, now)
        aggToWrite = agg
        await markProcessed(hotelId, freshHashes)
        const derived = deriveScores(agg)
        if (derived) geminiScores = derived
      } else if (called) {
        // Yanıt geldi ama parse edilemedi → hash'leri İŞARETLEME (retry) + Fix 4:
        // created_at'i ilerletme, otel bayat kalıp sonraki aramada hemen retry etsin.
        extractionFailed = true
      }
      // called=false (metin yok / API hatası) → işaretleme, sonraki tazelemede dene.
    }
    // fresh.length === 0 → hepsi işlenmiş; skor değişmez (saf decay ratio'yu değiştirmez),
    // TTL'i tazelemek için aşağıda yine de upsert edilir.
  }

  // hiç veri yoksa (ilk kez, yorum yok) yazma — boş satır bırakma
  if (!geminiScores && !google) return pack(google, prevScores)

  // Fix 4: extraction başarısızsa created_at'i İLERLETME (varsa eski değeri koru) →
  // hotel bayat kalır, sonraki aramada retry eder (7 gün TTL beklemez).
  const createdAt = extractionFailed && row?.created_at ? row.created_at : new Date(now).toISOString()

  supabaseAdmin
    .from('hotel_analysis')
    .upsert({
      hotel_id: hotelId,
      google_data: google,
      tripadvisor_data: null, // Terra kaldırıldı — tazelemede kalıntıyı temizle
      gemini_scores: geminiScores,
      signal_agg: aggToWrite,
      created_at: createdAt,
    })
    .then(({ error: e }) => {
      if (e) console.error('hotel_analysis upsert error:', e.message)
    })

  return pack(google, geminiScores)
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
