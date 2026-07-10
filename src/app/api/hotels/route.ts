import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { getTouristPlaces, type TouristData } from '@/lib/touristPlaces'
import { haversineMeters, formatDistance } from '@/lib/geo'
import { getHotelPhotoUrl } from '@/lib/hotelPhotos'
import { getHotelAnalysis, computeWeightedScore, type HotelAnalysisData } from '@/lib/hotelAnalysis'

// ----------------------------------------------------------------------------
// ⚠️ Rate limit ayarları — Nuitee çağrı maliyetine göre yeniden ayarlanacak.
// Şimdilik search ile aynı mertebe, placeholder.
// ----------------------------------------------------------------------------
const HOTELS_RATE_LIMIT = {
  dailyLimit: 30,          // IP başına günlük otel sorgusu (sayfalama/filtre yeniden çekimi dahil)
  burstLimit: 20,          // 1 dakikada bu kadar istek = bot şüphesi
  burstWindowMs: 60_000,   // 1 dakika
  banMs: 60 * 60_000,      // 1 saat ban
}

// ----------------------------------------------------------------------------
// ⚠️ Input validasyonu (Zod)
// Mapbox geocoding henüz yok, bu yüzden lokasyon iki şekilde gelebilir:
// lat/lng (Mapbox bağlanınca asıl yol) veya city+country (search'ten gelen
// ham metin, geçici köprü). En az biri zorunlu.
// ----------------------------------------------------------------------------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const BodySchema = z
  .object({
    latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude').optional(),
    longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude').optional(),
    radiusKm: z.number().min(1).max(50).default(5),
    city: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).optional(),
    // Tarih OPSİYONEL — kullanıcı belirtmezse Gemini null döndürür; server-side
    // makul bir default'a düşeriz (bkz. withDefaultDates). Verilirse format zorunlu.
    checkIn: z.string().regex(DATE_RE, 'checkIn must be YYYY-MM-DD').nullish(),
    checkOut: z.string().regex(DATE_RE, 'checkOut must be YYYY-MM-DD').nullish(),
    guests: z.number().int().min(1).max(10).default(2),
    budget: z
      .object({
        min: z.number().nonnegative().nullable().optional(),
        max: z.number().nonnegative().nullable().optional(),
        currency: z.string().length(3).default('EUR'),
      })
      .optional(),
    // Kullanıcı önceliği ağırlıkları (search'ten) — Staylo fit skorunu bunlarla hesaplarız.
    weights: z.record(z.string(), z.number()).optional(),
  })
  .refine((data) => !data.checkIn || !data.checkOut || new Date(data.checkOut) > new Date(data.checkIn), {
    message: 'checkOut must be after checkIn',
    path: ['checkOut'],
  })
  .refine(
    (data) =>
      data.budget?.min == null || data.budget?.max == null || data.budget.min <= data.budget.max,
    { message: 'budget.min must be <= budget.max', path: ['budget'] }
  )
  .refine((data) => (data.latitude != null && data.longitude != null) || (data.city && data.country), {
    message: 'Either coordinates or city and country are required',
    path: ['city'],
  })

// ----------------------------------------------------------------------------
// ⚠️ Koordinat sağlık kontrolü — (0,0) "null island" genelde bozuk/eksik
// geocoding sonucudur, Nuitee'ye öyle gönderilmemeli.
// ----------------------------------------------------------------------------
function isNullIsland(latitude: number, longitude: number): boolean {
  return latitude === 0 && longitude === 0
}

// ----------------------------------------------------------------------------
// Nuitee Connect (liteAPI) — https://docs.liteapi.travel
// ----------------------------------------------------------------------------
const NUITEE_BASE_URL = 'https://api.liteapi.travel/v3.0'
const NUITEE_TIMEOUT_MS = 10_000
// ⚠️ liteAPI'de guestNationality zorunlu, ama bizim filtrelerimizde henüz yok.
// Key gelince gerçek trafiğe göre kullanıcı lokasyonundan türetilecek.
const DEFAULT_GUEST_NATIONALITY = 'US'

// ⚠️ Geçici köprü: Mapbox geocoding gelene kadar city+country ile arama
// yapılıyor, Nuitee bunun için ISO-2 countryCode istiyor. Gemini bize İngilizce
// ülke adı döndürüyor (ör. "Turkey") — burada en yaygın arama destinasyonları
// için manuel eşleme var. Mapbox bağlanınca bu köprü tamamen kaldırılacak.
const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  turkey: 'TR', portugal: 'PT', spain: 'ES', italy: 'IT', france: 'FR',
  germany: 'DE', 'united kingdom': 'GB', uk: 'GB', greece: 'GR',
  netherlands: 'NL', austria: 'AT', switzerland: 'CH', belgium: 'BE',
  croatia: 'HR', 'czech republic': 'CZ', czechia: 'CZ', poland: 'PL',
  hungary: 'HU', ireland: 'IE', denmark: 'DK', sweden: 'SE', norway: 'NO',
  finland: 'FI', 'united states': 'US', usa: 'US', 'united arab emirates': 'AE',
  uae: 'AE', egypt: 'EG', morocco: 'MA', thailand: 'TH', japan: 'JP',
  mexico: 'MX', brazil: 'BR', australia: 'AU',
}

function countryToIso2(country: string): string | null {
  return COUNTRY_NAME_TO_ISO2[country.trim().toLowerCase()] ?? null
}

// Tarih verilmezse (kullanıcı belirtmedi → Gemini null) makul bir default'a düş:
// bugünden +30 gün, 2 gecelik konaklama. Nuitee her zaman geçerli tarih ister.
function withDefaultDates(checkIn?: string | null, checkOut?: string | null): { checkIn: string; checkOut: string } {
  if (checkIn && checkOut) return { checkIn, checkOut }
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const start = new Date()
  start.setUTCDate(start.getUTCDate() + 30)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 2)
  return { checkIn: fmt(start), checkOut: fmt(end) }
}

type NormalizedHotel = {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  photo: string | null
  price: { amount: number; currency: string } | null
  distanceToCenter: string | null
  nearbyAttractions: { name: string; distance: string; latitude: number; longitude: number }[]
}

// ⚠️ Kullanıcıya inen skor gövdesi. Not: lowConfidence / havuz boyutu / dağılım
// KASITLI olarak dışarı verilmez — "az veri" etiketi güveni zedeler, kararı
// kullanıcıya bırakırız (roadmap kuralı). Sadece skor + kaynak rating'leri iner.
const CRITERIA_KEYS = ['safety', 'quiet', 'family', 'value', 'walkability', 'cleanliness'] as const

type ScorePayload = {
  fit: number | null // ağırlıklı Staylo fit (0-10)
  criteria: Partial<Record<(typeof CRITERIA_KEYS)[number], number>> | null // her kriter 0-10
  summary: string | null
} | null

type SourceRating = { rating: number; reviewCount: number | null }

type ScoredHotel = NormalizedHotel & {
  score: ScorePayload
  sources: { google: SourceRating | null; tripadvisor: SourceRating | null }
}

// search default'larıyla aynı — hiç ağırlık gelmezse dengeli varsayılan.
const DEFAULT_WEIGHTS: Record<string, number> = {
  safety: 20, quiet: 20, family: 10, value: 25, walkability: 15, cleanliness: 10,
}

// hotel_analysis çıktısını + ağırlıklı toplamı kullanıcıya inen gövdeye çevirir.
function buildScoreFields(analysis: HotelAnalysisData, weights: Record<string, number>): {
  score: ScorePayload
  sources: ScoredHotel['sources']
} {
  const weighted = computeWeightedScore(analysis, weights)
  const raw = analysis.geminiScores?.scores
  let criteria: Partial<Record<(typeof CRITERIA_KEYS)[number], number>> | null = null
  if (raw) {
    const c: Partial<Record<(typeof CRITERIA_KEYS)[number], number>> = {}
    for (const k of CRITERIA_KEYS) {
      const v = raw[k]
      if (typeof v === 'number') c[k] = Math.round(v * 10) / 10
    }
    if (Object.keys(c).length) criteria = c
  }

  const score: ScorePayload =
    weighted.total == null && !criteria
      ? null
      : {
          fit: weighted.total != null ? Math.round(weighted.total * 10) / 10 : null,
          criteria,
          summary: analysis.geminiScores?.summary ?? null,
        }

  const google =
    analysis.google && typeof analysis.google.rating === 'number'
      ? { rating: analysis.google.rating, reviewCount: analysis.google.reviewCount }
      : null
  const tripadvisor =
    analysis.tripadvisor && typeof analysis.tripadvisor.rating === 'number'
      ? { rating: analysis.tripadvisor.rating, reviewCount: analysis.tripadvisor.reviewCount }
      : null

  return { score, sources: { google, tripadvisor } }
}

type HotelsParams = {
  latitude?: number
  longitude?: number
  radiusKm: number
  city?: string
  country?: string
  checkIn: string
  checkOut: string
  guests: number
  budget?: { min?: number | null; max?: number | null; currency: string }
}

// Nuitee'nin ham otel/rate objesini bizim gösterim formatımıza çevirir.
// ⚠️ Doğrulanmış yanıt şekli: POST /hotels/rates iki ayrı dizi döner —
// `data[]` (hotelId + roomTypes/rates, fiyat burada) ve `hotels[]` (id + name/
// main_photo/address/latitude/longitude/stars, otel içeriği burada). İkisi
// `hotelId` ↔ `id` üzerinden eşleşiyor, tek objede gelmiyor.
function normalizeHotel(raw: any, hotelMeta: any): NormalizedHotel {
  const firstRate = raw?.roomTypes?.[0]?.rates?.[0]
  const totalAmount = firstRate?.retailRate?.total?.[0]

  return {
    id: String(raw?.hotelId ?? ''),
    name: hotelMeta?.name ?? 'Unknown hotel',
    address: hotelMeta?.address ?? null,
    latitude: hotelMeta?.latitude ?? null,
    longitude: hotelMeta?.longitude ?? null,
    photo: hotelMeta?.main_photo ?? hotelMeta?.thumbnail ?? null,
    price: totalAmount ? { amount: totalAmount.amount, currency: totalAmount.currency } : null,
    distanceToCenter: null,
    nearbyAttractions: [],
  }
}

// Haversine ile şehir merkezine ve en yakın 2-3 turistik yere mesafe ekler.
// Otelin koordinatı yoksa (nadiren, hotelMeta eksikse) dokunmadan döner.
function enrichWithDistances(hotel: NormalizedHotel, tourist: TouristData): NormalizedHotel {
  if (hotel.latitude == null || hotel.longitude == null) return hotel
  const { latitude, longitude } = hotel

  const distanceToCenter = formatDistance(
    haversineMeters(latitude, longitude, tourist.cityCenter.latitude, tourist.cityCenter.longitude)
  )

  const nearbyAttractions = tourist.places
    .map((p) => ({ ...p, meters: haversineMeters(latitude, longitude, p.latitude, p.longitude) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, 3)
    .map((p) => ({
      name: p.name,
      distance: formatDistance(p.meters),
      latitude: p.latitude,
      longitude: p.longitude,
    }))

  return { ...hotel, distanceToCenter, nearbyAttractions }
}

type NuiteeFetchResult =
  | { ok: true; hotels: NormalizedHotel[] }
  | { ok: false; status: number; message: string }

async function fetchNuiteeHotels(params: HotelsParams): Promise<NuiteeFetchResult> {
  const apiKey = process.env.NUITEE_API_KEY
  if (!apiKey) {
    console.error('NUITEE_API_KEY missing')
    return { ok: false, status: 503, message: 'Hotel search is temporarily unavailable.' }
  }

  // Lokasyon: lat/lng varsa onu kullan, yoksa city+country (geçici köprü) — bkz. COUNTRY_NAME_TO_ISO2.
  let location: { latitude: number; longitude: number; radius: number } | { cityName: string; countryCode: string }
  if (params.latitude != null && params.longitude != null) {
    location = {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: Math.round(params.radiusKm * 1000), // km → metre
    }
  } else {
    const countryCode = params.country ? countryToIso2(params.country) : null
    if (!params.city || !countryCode) {
      return { ok: false, status: 400, message: 'Could not recognize this destination. Please try a more specific search.' }
    }
    location = { cityName: params.city, countryCode }
  }

  const currency = params.budget?.currency || 'EUR'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), NUITEE_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${NUITEE_BASE_URL}/hotels/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        ...location,
        checkin: params.checkIn,
        checkout: params.checkOut,
        currency,
        guestNationality: DEFAULT_GUEST_NATIONALITY,
        occupancies: [{ adults: params.guests, children: [] }],
        limit: 20,
        includeHotelData: true,
      }),
      signal: controller.signal,
    })
  } catch (err: any) {
    console.error('Nuitee fetch failed:', err?.message || err)
    const message =
      err?.name === 'AbortError'
        ? 'Hotel search is taking too long. Please try again.'
        : 'Could not reach hotel search provider. Please try again later.'
    return { ok: false, status: 502, message }
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    console.error('Nuitee API error:', response.status, bodyText)
    if (response.status === 401 || response.status === 403) {
      return { ok: false, status: 502, message: 'Hotel search is temporarily unavailable.' }
    }
    return { ok: false, status: 502, message: 'Could not fetch hotels right now. Please try again later.' }
  }

  let json: any
  try {
    json = await response.json()
  } catch (err) {
    console.error('Nuitee response parse error:', err)
    return { ok: false, status: 502, message: 'Received an invalid response from hotel search provider.' }
  }

  const rawHotels: any[] = Array.isArray(json?.data) ? json.data : []
  const hotelMetaById = new Map<string, any>(
    Array.isArray(json?.hotels) ? json.hotels.map((h: any) => [String(h.id), h]) : []
  )
  const hotels = rawHotels
    .slice(0, 20)
    .map((h) => normalizeHotel(h, hotelMetaById.get(String(h?.hotelId))))

  return { ok: true, hotels }
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
    const { latitude, longitude, budget, city, country, weights } = parsed.data

    // 2) ⚠️ Koordinat kontrolü (yalnızca lat/lng ile arandığında geçerli)
    if (latitude != null && longitude != null && isNullIsland(latitude, longitude)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    // 3) ⚠️ Rate limit
    const ip = getClientIp(request)
    const rl = await checkRateLimit(ip, 'hotels', HOTELS_RATE_LIMIT)
    if (!rl.allowed) {
      const msg =
        rl.reason === 'daily_limit'
          ? 'Daily hotel search limit reached. Try again tomorrow.'
          : 'Too many requests. Please try again later.'
      return NextResponse.json({ error: msg, reason: rl.reason }, { status: 429 })
    }

    // 4) Nuitee Connect üzerinden otel + fiyat sorgusu
    // Tarihleri default'la (yoksa +30g/2 gece) — Nuitee'ye her zaman geçerli tarih gitsin.
    const { checkIn, checkOut } = withDefaultDates(parsed.data.checkIn, parsed.data.checkOut)
    const result = await fetchNuiteeHotels({ ...parsed.data, checkIn, checkOut })
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status })
    }

    // 5) Bütçe filtresi — Nuitee'de doğrudan min/max fiyat parametresi yok,
    // istenen para birimiyle eşleşen fiyatlar üzerinde client-side filtreleniyor.
    let hotels = result.hotels
    if (budget && (budget.min != null || budget.max != null)) {
      const currency = budget.currency
      hotels = hotels.filter((h) => {
        if (!h.price || h.price.currency !== currency) return true
        if (budget.min != null && h.price.amount < budget.min) return false
        if (budget.max != null && h.price.amount > budget.max) return false
        return true
      })
    }

    if (hotels.length === 0) {
      return NextResponse.json({ hotels: [], message: 'No hotels found for this search.' })
    }

    // 6) Turistik yer / mesafe zenginleştirmesi (best-effort).
    // Şu an sadece city+country ile aramada mümkün — lat/lng ile arandığında
    // (Mapbox bağlanınca) şehir adı yok, reverse-geocoding henüz kapsam dışı.
    if (city && country) {
      const tourist = await getTouristPlaces(city, country)
      if (tourist) {
        hotels = hotels.map((h) => enrichWithDistances(h, tourist))
      }
    }

    // 7) Foto fallback — Nuitee foto vermediyse Google Places'ten dene (best-effort,
    // sadece eksik olanlar için — kota tasarrufu).
    hotels = await Promise.all(
      hotels.map(async (h) => {
        if (h.photo) return h
        try {
          const photo = await getHotelPhotoUrl(h.id, h.name, h.address)
          return photo ? { ...h, photo } : h
        } catch (err) {
          console.error('Hotel photo fallback failed:', err)
          return h
        }
      })
    )

    // 8) ⚠️ Skorlama: her otel için birikmiş yorum analizi (Google + Tripadvisor +
    // Gemini, TTL cache'li) → kullanıcı ağırlıklarıyla Staylo fit skoru. Analiz
    // başarısız/eksik olursa otel skorsuz iner (kart kırılmaz). country → ISO-2.
    const activeWeights =
      weights && Object.values(weights).some((v) => Number.isFinite(v) && v > 0) ? weights : DEFAULT_WEIGHTS
    const countryCode = country ? countryToIso2(country) : null

    const scored: ScoredHotel[] = await Promise.all(
      hotels.map(async (h): Promise<ScoredHotel> => {
        try {
          const analysis = await getHotelAnalysis(h.id, h.name, h.address, countryCode)
          const { score, sources } = buildScoreFields(analysis, activeWeights)
          return { ...h, score, sources }
        } catch (err) {
          console.error('Hotel analysis failed for', h.id, err instanceof Error ? err.message : err)
          return { ...h, score: null, sources: { google: null, tripadvisor: null } }
        }
      })
    )

    // Staylo fit'e göre sırala (skoru olan üstte, yüksek fit önce; skorsuzlar en sonda).
    scored.sort((a, b) => {
      const av = a.score?.fit ?? -1
      const bv = b.score?.fit ?? -1
      return bv - av
    })

    return NextResponse.json({ hotels: scored })
  } catch (error) {
    console.error('Hotels API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong while fetching hotels. Please try again.' },
      { status: 500 }
    )
  }
}
