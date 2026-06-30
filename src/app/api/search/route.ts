import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ----------------------------------------------------------------------------
// ⚠️ Rate limit ayarları (roadmap değerleri)
// ----------------------------------------------------------------------------
const DAILY_LIMIT = 10          // IP başına günlük arama
const BURST_LIMIT = 20          // 1 dakikada bu kadar istek = bot şüphesi
const BURST_WINDOW_MS = 60_000  // 1 dakika
const BAN_MS = 60 * 60_000      // 1 saat ban

// ----------------------------------------------------------------------------
// ⚠️ Input validasyonu (Zod) — XSS/aşırı uzunluk/yanlış tip koruması
// ----------------------------------------------------------------------------
const BodySchema = z.object({
  query: z.string().trim().min(2, 'Query too short').max(500, 'Query too long'),
})

// İstemci IP'sini Vercel header'larından çöz
function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

// ----------------------------------------------------------------------------
// Rate limit: Supabase rate_limits tablosunu oku/güncelle.
// Dönen: { allowed: boolean, reason?: string }
// ----------------------------------------------------------------------------
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; reason?: string }> {
  const now = Date.now()

  const { data: row, error: rlError } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('ip', ip)
    .maybeSingle()

  if (rlError) {
    console.error('rate_limit select error:', rlError.message)
    // DB okunamıyorsa kullanıcıyı bloklama — isteğe izin ver (fail-open)
    return { allowed: true }
  }

  // Banlıysa: ban bitmemişse reddet
  if (row?.banned_until && new Date(row.banned_until).getTime() > now) {
    return { allowed: false, reason: 'banned' }
  }

  // Hiç kayıt yoksa: ilk istek, oluştur
  if (!row) {
    await supabaseAdmin.from('rate_limits').insert({
      ip,
      count: 1,
      window_start: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    })
    return { allowed: true }
  }

  const windowStart = new Date(row.window_start).getTime()
  const elapsed = now - windowStart

  // Burst kontrolü: pencere 1 dk içindeyse ve sayı BURST_LIMIT'i aştıysa → BAN
  if (elapsed < BURST_WINDOW_MS && row.count + 1 > BURST_LIMIT) {
    await supabaseAdmin
      .from('rate_limits')
      .update({
        banned_until: new Date(now + BAN_MS).toISOString(),
        updated_at: new Date(now).toISOString(),
      })
      .eq('ip', ip)
    // TODO: Resend ile hazalkalmis@gmail.com'a alert (key gelince)
    return { allowed: false, reason: 'banned' }
  }

  // Günlük pencere: 24 saat geçtiyse sayacı sıfırla
  const DAY_MS = 24 * 60 * 60_000
  if (elapsed > DAY_MS) {
    await supabaseAdmin
      .from('rate_limits')
      .update({ count: 1, window_start: new Date(now).toISOString(), updated_at: new Date(now).toISOString() })
      .eq('ip', ip)
    return { allowed: true }
  }

  // Günlük limit aşıldı mı?
  if (row.count + 1 > DAILY_LIMIT) {
    return { allowed: false, reason: 'daily_limit' }
  }

  // Normal: sayacı artır
  await supabaseAdmin
    .from('rate_limits')
    .update({ count: row.count + 1, updated_at: new Date(now).toISOString() })
    .eq('ip', ip)
  return { allowed: true }
}

// ----------------------------------------------------------------------------
// weights normalize: toplamı 100'e sabitle (Gemini şaşırsa bile garanti)
// ----------------------------------------------------------------------------
function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  const keys = ['safety', 'quiet', 'family', 'value', 'walkability', 'cleanliness']
  const clean: Record<string, number> = {}
  let sum = 0
  for (const k of keys) {
    const v = Number(weights?.[k])
    clean[k] = Number.isFinite(v) && v > 0 ? v : 0
    sum += clean[k]
  }
  if (sum === 0) {
    return { safety: 20, quiet: 20, family: 10, value: 25, walkability: 15, cleanliness: 10 }
  }
  let scaled = keys.map((k) => ({ k, v: Math.round((clean[k] * 100) / sum) }))
  const drift = 100 - scaled.reduce((s, x) => s + x.v, 0)
  if (drift !== 0) {
    scaled.sort((a, b) => b.v - a.v)
    scaled[0].v += drift
  }
  const out: Record<string, number> = {}
  for (const { k, v } of scaled) out[k] = v
  return out
}

export async function POST(request: NextRequest) {
  try {
    // 1) ⚠️ Input validasyonu
    const raw = await request.json().catch(() => null)
    const parsed = BodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { query } = parsed.data

    // 2) ⚠️ Rate limit
    const ip = getClientIp(request)
    const rl = await checkRateLimit(ip)
    if (!rl.allowed) {
      const msg =
        rl.reason === 'daily_limit'
          ? 'Daily search limit reached. Try again tomorrow.'
          : 'Too many requests. Please try again later.'
      return NextResponse.json({ error: msg, reason: rl.reason }, { status: 429 })
    }

    // 3) Gemini ile NL → JSON
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `Extract hotel search filters from this query. Return ONLY valid JSON, no markdown, no explanation.

Query: "${query}"

Return this exact JSON structure:
{
  "city": "city name in English",
  "country": "country name in English",
  "checkIn": "YYYY-MM-DD or null",
  "checkOut": "YYYY-MM-DD or null",
  "guests": number,
  "budget": { "min": number or null, "max": number or null, "currency": "EUR" },
  "priorities": ["safety", "quiet", "family", "value", "walkability", "cleanliness"],
  "mustHaves": ["pool", "breakfast", "parking", "wifi", "gym"],
  "weights": {
    "safety": 0-100,
    "quiet": 0-100,
    "family": 0-100,
    "value": 0-100,
    "walkability": 0-100,
    "cleanliness": 0-100
  },
  "userLanguage": "ISO 639-1 code of the query language, e.g. tr, en, de, fr, es"
}

Rules:
- Understand queries in any language (Turkish, English, German, French, Spanish)
- All field VALUES must be in English (city/country in English), EXCEPT userLanguage which is the detected language code
- weights must sum to 100
- If not mentioned, set safety:20, quiet:20, family:10, value:25, walkability:15, cleanliness:10
- Extract dates if mentioned, otherwise null
- guests default: 2`

    let text: string
    try {
      const result = await model.generateContent(prompt)
      text = result.response.text()
    } catch (err: any) {
      // ⚠️ Gemini kota/oran limiti (429) → kullanıcıya nazik "yoğunuz" mesajı
      const status = err?.status || err?.response?.status
      if (status === 429) {
        return NextResponse.json(
          { error: 'We are a bit busy right now. Please try again in a moment.', reason: 'ai_busy' },
          { status: 503 }
        )
      }
      console.error('Gemini error:', err?.message || err)
      return NextResponse.json({ error: 'Failed to process query' }, { status: 500 })
    }

    // 4) JSON parse koruması — Gemini bozuk dönerse çökme
    let filters: any
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      filters = JSON.parse(cleanText)
    } catch {
      return NextResponse.json(
        { error: 'Could not understand the query. Please rephrase.' },
        { status: 422 }
      )
    }

    // 5) weights normalize (toplam = 100 garanti)
    filters.weights = normalizeWeights(filters.weights || {})

    // userLanguage güvenli varsayılan
    if (typeof filters.userLanguage !== 'string') filters.userLanguage = 'en'

    // 6) Aramayı logla (best-effort: hata olsa da kullanıcıyı durdurma)
    supabaseAdmin
      .from('searches')
      .insert({
        query,
        filters_json: filters,
        user_language: filters.userLanguage,
        ip,
      })
      .then(
        ({ error }) => { if (error) console.error('search insert error:', error.message) },
        (e) => console.error('search insert threw:', e)
      )

    return NextResponse.json({ filters })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 })
  }
}