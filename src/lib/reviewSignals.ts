import 'server-only'
import { createHash } from 'node:crypto'

// ============================================================================
// ⚠️⚠️⚠️ STAYLO ÇEKİRDEĞİ — TAKLİT EDİLEMEZ KISIM ⚠️⚠️⚠️
// No-store review scoring: ham yorum metni ASLA saklanmaz. Her yorum RAM'de
// çıkarılır (per-kriter + per-aspect sentiment 0-10), hotel-seviyesi ZAMAN-
// SÖNÜMLÜ (EMA) toplam sayılara karışır, sonra metin + kimlik atılır.
//
// Dedup: sadece server-gizli PEPPER'lı opak SHA-256 hash (processed_reviews).
// Yorumun tarihi/kimliği/kendi satırı HİÇBİR yerde tutulmaz → seyrek-gün
// korelasyonu kapalı. Aggregate server-only — tarayıcıya inmez.
// ============================================================================

// ---- Kriterler --------------------------------------------------------------
// İlk 6 = kullanıcı weight anahtarlarıyla birebir → ağırlıklı Fit skoru bunlardan.
// 'staff' skorlanır + depolanır ama Fit'e GİRMEZ, UI'da çip olarak GÖRÜNMEZ.
export const WEIGHTED_CRITERIA = ['safety', 'quiet', 'family', 'value', 'walkability', 'cleanliness'] as const
export const SCORE_CRITERIA = [...WEIGHTED_CRITERIA, 'staff'] as const
export type ScoreCriterion = (typeof SCORE_CRITERIA)[number]

// ---- 19 aspect etiketi (sabit enum — parafraz/serbest metin YOK) ------------
// En zengin şekilde depolanır ama Fit'e girmez, UI'da yeni çip olmaz: arka plan.
// NOT: quiet ↔ neighbor_noise ÖRTÜŞEN (dışlayıcı değil): quiet tüm gürültüyü
// (sokak dahil) kapsar; neighbor_noise ek olarak oda/koridor/komşu detayını verir.
export const ASPECTS = [
  'air_conditioning', 'bed_comfort', 'room_size', 'room_condition', 'bathroom',
  'room_smell', 'wifi', 'pool', 'spa_gym', 'parking', 'elevator', 'breakfast',
  'dining', 'checkin_experience', 'billing', 'view', 'amenities', 'accessibility',
  'neighbor_noise',
] as const
export type Aspect = (typeof ASPECTS)[number]

// ---- EMA sabitleri (onaylı mikro-kararlar) ----------------------------------
export const EMA_HALFLIFE_DAYS = 540 // ~18 ay — eski katkılar bu sürede yarıya iner
export const MIN_EMA_COUNT = 0.5 // bu efektif-sayının altındaki kriter/aspect → noSignal
const DAY_MS = 24 * 60 * 60_000

// ---- Aggregate şekli (hotel_analysis.signal_agg jsonb) -----------------------
export type SignalStat = { emaSum: number; emaCount: number }
export type SignalAgg = {
  criteria: Partial<Record<ScoreCriterion, SignalStat>>
  aspects: Partial<Record<Aspect, SignalStat>>
  dist: { pos: number; neg: number; neu: number } // sönümlü rating dağılımı
  reviewCount: number // sönümsüz — işlenen toplam yorum (lowConfidence/poolSize için)
  lastUpdated: string // ISO — decay hesabı bundan
}

// Türetilmiş çıktı (gemini_scores) — ŞEKLİ BUGÜNKÜYLE BİREBİR AYNI kalır, böylece
// api/hotels + computeWeightedScore + UI hiç değişmez.
export type ReviewDistribution = { total: number; positive: number; negative: number; neutral: number }
export type GeminiScores = {
  scores: Partial<Record<ScoreCriterion, number>>
  noSignal: ScoreCriterion[]
  summary: string | null
  distribution: ReviewDistribution
  poolSize: number
}

// Bir batch'in (yeni yorumların) çıkarılmış katkısı — koda aggregate edilmiş hali.
export type BatchContribution = {
  criteria: Partial<Record<ScoreCriterion, { count: number; sum: number }>>
  aspects: Partial<Record<Aspect, { count: number; sum: number }>>
  dist: { pos: number; neg: number; neu: number }
  n: number
}

// ----------------------------------------------------------------------------
// Dedup hash — server-gizli PEPPER ile tek yönlü. review_key = "author_url|time".
// PEPPER olmadan güvenli dedup yapılamaz → çağıran fail-safe davranmalı (null).
// ----------------------------------------------------------------------------
export function getPepper(): string | null {
  const p = process.env.REVIEW_DEDUP_PEPPER
  return p && p.length > 0 ? p : null
}

export function dedupHash(pepper: string, reviewKey: string): string {
  // 'google' etiketi ileride ek kaynak eklenirse çarpışmayı önler.
  return createHash('sha256').update(`${pepper}|google|${reviewKey}`).digest('hex')
}

// ----------------------------------------------------------------------------
// EMA: decay (ratio'yu değiştirmez, sadece eski katkıları taze karşısında zayıflatır)
// ----------------------------------------------------------------------------
export function emptyAgg(): SignalAgg {
  return { criteria: {}, aspects: {}, dist: { pos: 0, neg: 0, neu: 0 }, reviewCount: 0, lastUpdated: new Date(0).toISOString() }
}

export function decayAgg(agg: SignalAgg, nowMs: number): void {
  const last = new Date(agg.lastUpdated).getTime()
  const deltaDays = Math.max(0, (nowMs - (Number.isFinite(last) ? last : 0)) / DAY_MS)
  if (deltaDays === 0) return
  const d = Math.pow(0.5, deltaDays / EMA_HALFLIFE_DAYS)
  for (const k of Object.keys(agg.criteria) as ScoreCriterion[]) {
    const s = agg.criteria[k]!
    s.emaSum *= d
    s.emaCount *= d
  }
  for (const k of Object.keys(agg.aspects) as Aspect[]) {
    const s = agg.aspects[k]!
    s.emaSum *= d
    s.emaCount *= d
  }
  agg.dist.pos *= d
  agg.dist.neg *= d
  agg.dist.neu *= d
}

// Taze batch'i (tam ağırlık 1) ekle. reviewCount sönümsüz artar.
export function addBatch(agg: SignalAgg, batch: BatchContribution, nowMs: number): void {
  for (const k of Object.keys(batch.criteria) as ScoreCriterion[]) {
    const b = batch.criteria[k]!
    const cur = agg.criteria[k] ?? { emaSum: 0, emaCount: 0 }
    cur.emaSum += b.sum
    cur.emaCount += b.count
    agg.criteria[k] = cur
  }
  for (const k of Object.keys(batch.aspects) as Aspect[]) {
    const b = batch.aspects[k]!
    const cur = agg.aspects[k] ?? { emaSum: 0, emaCount: 0 }
    cur.emaSum += b.sum
    cur.emaCount += b.count
    agg.aspects[k] = cur
  }
  agg.dist.pos += batch.dist.pos
  agg.dist.neg += batch.dist.neg
  agg.dist.neu += batch.dist.neu
  agg.reviewCount += batch.n
  agg.lastUpdated = new Date(nowMs).toISOString()
}

// ----------------------------------------------------------------------------
// Türet: signal_agg → gemini_scores (bugünkü şekil). Skor = emaSum/emaCount.
// emaCount < MIN_EMA_COUNT olan kriter skorlanmaz (noSignal) — 5.0 default YOK.
// ----------------------------------------------------------------------------
export function deriveScores(agg: SignalAgg): GeminiScores | null {
  const scores: Partial<Record<ScoreCriterion, number>> = {}
  for (const k of SCORE_CRITERIA) {
    const s = agg.criteria[k]
    if (s && s.emaCount >= MIN_EMA_COUNT) {
      scores[k] = Math.max(0, Math.min(10, s.emaSum / s.emaCount))
    }
  }
  if (Object.keys(scores).length === 0) return null
  const noSignal = SCORE_CRITERIA.filter((k) => !(k in scores))

  const pos = Math.round(agg.dist.pos)
  const neg = Math.round(agg.dist.neg)
  const neu = Math.round(agg.dist.neu)
  const distribution: ReviewDistribution = { total: pos + neg + neu, positive: pos, negative: neg, neutral: neu }

  return {
    scores,
    noSignal,
    summary: templateSummary(scores, agg.aspects),
    distribution,
    poolSize: agg.reviewCount,
  }
}

// ----------------------------------------------------------------------------
// Template özet — Gemini çağrısı YOK. Aggregate sayılardan deterministik cümle.
// ----------------------------------------------------------------------------
const CRITERION_LABEL: Record<ScoreCriterion, string> = {
  safety: 'safety', quiet: 'quietness', family: 'family-friendliness', value: 'value',
  walkability: 'location', cleanliness: 'cleanliness', staff: 'staff',
}
const ASPECT_LABEL: Record<Aspect, string> = {
  air_conditioning: 'air conditioning', bed_comfort: 'bed comfort', room_size: 'room size',
  room_condition: 'room condition', bathroom: 'the bathroom', room_smell: 'room odor',
  wifi: 'wifi', pool: 'the pool', spa_gym: 'spa/gym', parking: 'parking', elevator: 'the elevator',
  breakfast: 'breakfast', dining: 'dining', checkin_experience: 'check-in', billing: 'billing',
  view: 'the view', amenities: 'amenities', accessibility: 'accessibility', neighbor_noise: 'in-room noise',
}

function joinList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function templateSummary(
  scores: Partial<Record<ScoreCriterion, number>>,
  aspects: Partial<Record<Aspect, SignalStat>>
): string | null {
  // Fit'i belirleyen 6 kriter üzerinden güçlü/zayıf.
  const rated = WEIGHTED_CRITERIA.filter((c) => typeof scores[c] === 'number').sort(
    (a, b) => (scores[b] as number) - (scores[a] as number)
  )
  if (rated.length === 0) return null
  const strong = rated.filter((c) => (scores[c] as number) >= 8).slice(0, 3).map((c) => CRITERION_LABEL[c])
  const weak = rated.filter((c) => (scores[c] as number) < 6).map((c) => CRITERION_LABEL[c])

  // En çok bahsedilen aspect'ler (emaCount) → olumlu (>=7) / olumsuz (<=4) vurgu.
  const aspRanked = (Object.keys(aspects) as Aspect[])
    .map((a) => ({ a, st: aspects[a]! }))
    .filter((x) => x.st.emaCount >= MIN_EMA_COUNT)
    .sort((x, y) => y.st.emaCount - x.st.emaCount)
  const aspPos = aspRanked.filter((x) => x.st.emaSum / x.st.emaCount >= 7).slice(0, 2).map((x) => ASPECT_LABEL[x.a])
  const aspNeg = aspRanked.filter((x) => x.st.emaSum / x.st.emaCount <= 4).slice(0, 2).map((x) => ASPECT_LABEL[x.a])

  const parts: string[] = []
  if (strong.length) parts.push(`Guests consistently praise ${joinList(strong)}`)
  else parts.push(`Guests give a mixed overall impression`)
  if (weak.length) parts.push(`more mixed on ${joinList(weak)}`)
  const notes: string[] = []
  if (aspPos.length) notes.push(`highlights include ${joinList(aspPos)}`)
  if (aspNeg.length) notes.push(`some concerns about ${joinList(aspNeg)}`)

  let out = parts.join('; ')
  if (notes.length) out += ` — ${joinList(notes)}`
  return `${out}.`
}

// ----------------------------------------------------------------------------
// Extraction prompt — YENİ yorumlar üzerinde TEK Gemini çağrısı (temperature:0).
// Her yorum için SADECE bahsedilen kriter/aspect'leri sentiment 0-10 ile döndürür.
// ----------------------------------------------------------------------------
export function buildExtractionPrompt(reviews: { rating: number | null; text: string }[]): string {
  const body = reviews
    .map((r, i) => `#${i} [${r.rating ?? '?'}/5] ${r.text.slice(0, 600)}`)
    .join('\n')

  return `You are a hotel review analyst. For EACH review below, extract sentiment ONLY for the criteria and aspects it ACTUALLY discusses. Score each mentioned item 0-10 (0 = terrible, 10 = excellent). OMIT anything a review does not mention — never guess, never use a neutral default. Return ONLY valid JSON, no markdown.

CRITERIA (7):
- safety: how safe guests feel (neighbourhood, at night, security)
- quiet: quietness / absence of noise (covers ALL noise incl. street traffic)
- family: suitability for families (kids, space, family amenities)
- value: value for money (price vs. quality)
- walkability: location — proximity to centre, transit, walkable surroundings
- cleanliness: cleanliness / housekeeping
- staff: staff helpfulness and service quality

ASPECTS (19, more specific): air_conditioning, bed_comfort, room_size, room_condition, bathroom, room_smell, wifi, pool, spa_gym, parking, elevator, breakfast, dining, checkin_experience, billing, view, amenities, accessibility, neighbor_noise (in-room/corridor/next-door noise — this OVERLAPS with quiet, list both when relevant).

Reviews:
${body}

Return exactly this shape (one object per review, in order; include ONLY mentioned keys):
{"reviews":[{"i":0,"c":{"cleanliness":8,"staff":9},"a":{"breakfast":7,"room_smell":2}}, ...]}`
}

// Metinden İLK dengeli {…} bloğunu ayıkla (string/escape farkında). Gemini JSON'un
// etrafına düz metin eklerse ("Here is the JSON: {…}") kurtarmak için lenient fallback.
function extractFirstJsonObject(s: string): string | null {
  const start = s.indexOf('{')
  if (start < 0) return null
  let depth = 0, inStr = false, esc = false
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (inStr) {
      if (esc) esc = false
      else if (ch === '\\') esc = true
      else if (ch === '"') inStr = false
    } else if (ch === '"') inStr = true
    else if (ch === '{') depth++
    else if (ch === '}') { depth--; if (depth === 0) return s.slice(start, i + 1) }
  }
  return null
}

function tryParse(raw: string): any {
  try { return JSON.parse(raw) } catch { return undefined }
}

// Gemini yanıtını batch katkısına çevir. Ratings ayrı verilir (dağılım için).
// hotelId sadece parse-fail teşhis logu için (hangi otel + ham yanıt kesiti).
export function parseExtraction(
  text: string,
  ratings: (number | null)[],
  hotelId?: string
): BatchContribution | null {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  let parsed: any = tryParse(cleaned)
  if (parsed === undefined) {
    // Fallback: ilk dengeli {…} bloğunu ayıklayıp tekrar dene.
    const block = extractFirstJsonObject(cleaned)
    if (block) parsed = tryParse(block)
  }
  if (parsed === undefined) {
    const snippet = text.slice(0, 300).replace(/\s+/g, ' ').trim()
    console.error(`extraction: JSON parse failed hotel=${hotelId ?? '?'} raw="${snippet}"`)
    return null
  }
  const rows = Array.isArray(parsed?.reviews) ? parsed.reviews : null
  if (!rows) return null

  const criteria: BatchContribution['criteria'] = {}
  const aspects: BatchContribution['aspects'] = {}
  const criterionSet = new Set<string>(SCORE_CRITERIA)
  const aspectSet = new Set<string>(ASPECTS)

  const add = (
    bag: Record<string, { count: number; sum: number }>,
    allowed: Set<string>,
    key: string,
    val: any
  ) => {
    if (!allowed.has(key)) return
    const v = Number(val)
    if (!Number.isFinite(v)) return
    const s = Math.max(0, Math.min(10, v))
    const cur = bag[key] ?? { count: 0, sum: 0 }
    cur.count += 1
    cur.sum += s
    bag[key] = cur
  }

  for (const row of rows) {
    if (row?.c && typeof row.c === 'object') {
      for (const [k, val] of Object.entries(row.c)) add(criteria as any, criterionSet, k, val)
    }
    if (row?.a && typeof row.a === 'object') {
      for (const [k, val] of Object.entries(row.a)) add(aspects as any, aspectSet, k, val)
    }
  }

  // Dağılım: rating bazlı (>=4 pos, <=2 neg, ==3 neu). Objektif, Gemini'siz.
  let pos = 0, neg = 0, neu = 0
  for (const r of ratings) {
    if (r == null) continue
    if (r >= 4) pos++
    else if (r <= 2) neg++
    else neu++
  }

  if (Object.keys(criteria).length === 0 && Object.keys(aspects).length === 0) return null
  return { criteria, aspects, dist: { pos, neg, neu }, n: ratings.length }
}
