// ============================================================================
// STAYLO — Hafta 8 migration: no-store review scoring seed
// ----------------------------------------------------------------------------
// NE YAPAR:
//   1) hotel_analysis'teki her otelin bugünkü gemini_scores'undan SEED-PRIOR
//      signal_agg üretir (skor = emaSum/emaCount → BUGÜNKÜ SKOR BİREBİR KORUNUR).
//   2) Self-check: seed'ten türetilen skor, orijinal skorla aynı mı? (drift raporu)
//   3) hotel_reviews'teki review_key'leri PEPPER'la hash'leyip processed_reviews'a
//      yazar (dedup sürekliliği → migration sonrası mevcut yorumlar çift sayılmaz).
//
// ÇALIŞTIRMA:
//   node --env-file=.env.local scripts/migrate-signal-agg.mjs        # uygula
//   node --env-file=.env.local scripts/migrate-signal-agg.mjs --dry  # önizle (yazma yok)
//
// ÖN KOŞUL: _docs/staylo_week8_no_store_signals.sql AŞAMA A çalıştırılmış olmalı
//           (.env.local'de REVIEW_DEDUP_PEPPER tanımlı olmalı).
// ============================================================================
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

const DRY = process.argv.includes('--dry')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const pepper = process.env.REVIEW_DEDUP_PEPPER
if (!url || !key) { console.error('EKSİK: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
if (!pepper) { console.error('EKSİK: REVIEW_DEDUP_PEPPER (.env.local\'e ekle — uzun rastgele string)'); process.exit(1) }

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

// reviewSignals.ts ile BİREBİR aynı: sha256(pepper|google|reviewKey)
const dedupHash = (reviewKey) => createHash('sha256').update(`${pepper}|google|${reviewKey}`).digest('hex')

const SCORE_CRITERIA = ['safety', 'quiet', 'family', 'value', 'walkability', 'cleanliness', 'staff']
const MIN_EMA_COUNT = 0.5

// deriveScores (reviewSignals.ts) ile aynı — self-check için
function derive(agg) {
  const scores = {}
  for (const k of SCORE_CRITERIA) {
    const s = agg.criteria[k]
    if (s && s.emaCount >= MIN_EMA_COUNT) scores[k] = Math.max(0, Math.min(10, s.emaSum / s.emaCount))
  }
  return scores
}

function seedAgg(gs, ts) {
  const scores = gs?.scores ?? {}
  const dist = gs?.distribution ?? { total: 0, positive: 0, negative: 0, neutral: 0 }
  const poolSize = Number(gs?.poolSize) || 0
  // prior ağırlık = havuz boyutu ( atalet). Yoksa dağılım toplamı, o da yoksa 15.
  const w = poolSize > 0 ? poolSize : (dist.total > 0 ? dist.total : 15)
  const criteria = {}
  for (const [k, v] of Object.entries(scores)) {
    if (typeof v === 'number' && Number.isFinite(v)) criteria[k] = { emaSum: v * w, emaCount: w }
  }
  return {
    criteria, aspects: {},
    dist: { pos: dist.positive || 0, neg: dist.negative || 0, neu: dist.neutral || 0 },
    reviewCount: w, lastUpdated: new Date(ts).toISOString(),
  }
}

async function main() {
  console.log(`STAYLO signal_agg migration ${DRY ? '(DRY-RUN — yazma yok)' : '(APPLY)'}\n`)
  const nowIso = new Date().toISOString()

  // ---- 1) SEED signal_agg + self-check --------------------------------------
  const { data: rows, error } = await db
    .from('hotel_analysis')
    .select('hotel_id, gemini_scores, signal_agg')
  if (error) { console.error('hotel_analysis read error:', error.message); process.exit(1) }

  let seeded = 0, skippedExisting = 0, noScores = 0, driftCount = 0
  let maxDrift = 0
  for (const row of rows) {
    if (row.signal_agg) { skippedExisting++; continue } // idempotent
    const gs = row.gemini_scores
    if (!gs?.scores || Object.keys(gs.scores).length === 0) { noScores++; continue }

    const agg = seedAgg(gs, nowIso)
    // self-check: seed'ten türetilen skor == orijinal
    const d = derive(agg)
    for (const k of Object.keys(gs.scores)) {
      const diff = Math.abs((d[k] ?? NaN) - gs.scores[k])
      if (!(diff <= 1e-9)) { driftCount++; maxDrift = Math.max(maxDrift, diff); console.log(`  DRIFT ${row.hotel_id} ${k}: ${d[k]} vs ${gs.scores[k]}`) }
    }

    if (!DRY) {
      const { error: e } = await db.from('hotel_analysis').update({ signal_agg: agg }).eq('hotel_id', row.hotel_id)
      if (e) { console.error(`  update fail ${row.hotel_id}:`, e.message); continue }
    }
    seeded++
    if (seeded % 25 === 0) console.log(`  …seeded ${seeded}`)
  }
  console.log(`\n[SEED] toplam=${rows.length} seeded=${seeded} zaten-var(atlandı)=${skippedExisting} skorsuz=${noScores}`)
  console.log(`[SELF-CHECK] drift kolon sayısı=${driftCount} maxDrift=${maxDrift}  → ${driftCount === 0 ? 'MEVCUT SKORLAR DEĞİŞMEDİ ✓' : '⚠️ DRIFT VAR'}`)

  // ---- 2) hotel_reviews → processed_reviews (dedup sürekliliği) --------------
  // Eski review_key'leri (author_url|time) hash'leyip yaz. Böylece migration sonrası
  // aynı yorumlar Google'dan tekrar gelince ÇİFT SAYILMAZ.
  let hasReviews = true
  let reviewTotal = 0, hashInserted = 0
  const PAGE = 1000
  for (let from = 0; hasReviews; from += PAGE) {
    const { data: revs, error: re } = await db
      .from('hotel_reviews')
      .select('hotel_id, review_key')
      .range(from, from + PAGE - 1)
    if (re) {
      if (re.code === '42P01') { console.log('\n[DEDUP] hotel_reviews yok (zaten düşürülmüş) — atlanıyor'); hasReviews = false; break }
      console.error('hotel_reviews read error:', re.message); break
    }
    if (!revs || revs.length === 0) { hasReviews = false; break }
    reviewTotal += revs.length

    const seen = new Set()
    const chunk = []
    for (const r of revs) {
      if (!r.review_key) continue
      const h = dedupHash(r.review_key)
      const dedupKey = `${r.hotel_id}|${h}`
      if (seen.has(dedupKey)) continue
      seen.add(dedupKey)
      chunk.push({ hotel_id: r.hotel_id, dedup_hash: h })
    }
    if (!DRY && chunk.length) {
      const { error: ie } = await db.from('processed_reviews').upsert(chunk, { onConflict: 'hotel_id,dedup_hash', ignoreDuplicates: true })
      if (ie) console.error('  processed_reviews insert error:', ie.message)
    }
    hashInserted += chunk.length
    if (revs.length < PAGE) hasReviews = false
  }
  console.log(`\n[DEDUP] hotel_reviews okunan=${reviewTotal} → processed_reviews hash=${hashInserted}`)

  console.log(`\nDONE ${DRY ? '(DRY — hiçbir şey yazılmadı)' : ''} — drift=${driftCount}`)
  if (!DRY && driftCount === 0) console.log('→ Güvenle AŞAMA B (drop hotel_reviews) çalıştırılabilir.')
}

main().catch((e) => { console.error(e); process.exit(1) })
