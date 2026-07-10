import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { verifyTurnstile } from '@/lib/turnstile'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ----------------------------------------------------------------------------
// ⚠️ Rate limit ayarları (roadmap değerleri)
// ----------------------------------------------------------------------------
const SEARCH_RATE_LIMIT = {
  dailyLimit: 10,          // IP başına günlük arama
  burstLimit: 20,          // 1 dakikada bu kadar istek = bot şüphesi
  burstWindowMs: 60_000,   // 1 dakika
  banMs: 60 * 60_000,      // 1 saat ban
}

// ----------------------------------------------------------------------------
// ⚠️ Input validasyonu (Zod) — XSS/aşırı uzunluk/yanlış tip koruması
// ----------------------------------------------------------------------------
const BodySchema = z.object({
  query: z.string().trim().min(2, 'Query too short').max(500, 'Query too long'),
  turnstileToken: z.string().optional(),
})

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
    const { query, turnstileToken } = parsed.data
    const ip = getClientIp(request)

    // ---------- honeypot: bot gizli alani doldurduysa sessizce bos basari don ----------
    const rawBody: any = raw || {}
    if (typeof rawBody.hp === "string" && rawBody.hp.trim() !== "") {
      return NextResponse.json({
        filters: { city:"", country:"", checkIn:null, checkOut:null, guests:2,
          budget:{min:null,max:null,currency:"EUR"}, priorities:[], mustHaves:[],
          weights:{safety:20,quiet:20,family:10,value:25,walkability:15,cleanliness:10}, userLanguage:"en" }
      })
    }

    // ---------- Turnstile: honeypot'un ÜSTÜNE ikinci bot koruması katmanı ----------
    const turnstileOk = await verifyTurnstile(turnstileToken || '', ip)
    if (!turnstileOk) {
      return NextResponse.json(
        { error: 'Verification failed. Please refresh the page and try again.', reason: 'turnstile_failed' },
        { status: 403 }
      )
    }

    // 2) ⚠️ Rate limit
    const rl = await checkRateLimit(ip, 'search', SEARCH_RATE_LIMIT)
    if (!rl.allowed) {
      const msg =
        rl.reason === 'daily_limit'
          ? 'Daily search limit reached. Try again tomorrow.'
          : 'Too many requests. Please try again later.'
      return NextResponse.json({ error: msg, reason: rl.reason }, { status: 429 })
    }

    // 3) Gemini ile NL → JSON
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
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
      // ⚠️ Geçici Gemini hatası (kota 429 / aşırı yük 503 / 5xx) → nazik "yoğunuz".
      // SDK err.status'u güvenilir set etmiyor; kodu hata MESAJINDAN da parse et
      // (ör. "...: [503 Service Unavailable] ..."). 404 (ölü model) / 4xx (config)
      // geçici DEĞİL → sert 500 "Failed to process query" olarak kalır.
      const msg = String(err?.message ?? err ?? '')
      const status =
        Number(err?.status) ||
        Number(err?.response?.status) ||
        Number((msg.match(/\[(\d{3})\b/) || [])[1]) ||
        0
      const transient = status === 429 || (status >= 500 && status <= 599)
      if (transient) {
        console.error('Gemini transient error:', status, msg.slice(0, 160))
        return NextResponse.json(
          { error: 'We are a bit busy right now. Please try again in a moment.', reason: 'ai_busy' },
          { status: 503 }
        )
      }
      console.error('Gemini error:', msg)
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