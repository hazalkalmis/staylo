import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type TouristPlace = {
  name: string
  latitude: number
  longitude: number
  category: string | null
}

export type TouristData = {
  cityCenter: { latitude: number; longitude: number }
  places: TouristPlace[]
}

const CACHE_TTL_MS = 24 * 60 * 60_000
const FETCH_TIMEOUT_MS = 15_000
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
// ⚠️ Nominatim kullanım politikası: istekleri tanımlayan bir User-Agent zorunlu.
const USER_AGENT = 'Staylo/0.1 (+hazalkalmis@gmail.com)'

// "Istanbul" + "Turkey" -> "istanbul|turkey" — aynı isimli şehirlerin farklı
// ülkelerde cache çakışmasını önlemek için composite key.
function cacheKey(city: string, country: string): string {
  return `${city.trim().toLowerCase()}|${country.trim().toLowerCase()}`
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function geocodeCity(
  city: string,
  country: string
): Promise<{ latitude: number; longitude: number } | null> {
  const params = new URLSearchParams({ format: 'json', limit: '1', city, country })
  const res = await fetchWithTimeout(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  const first = Array.isArray(data) ? data[0] : null
  if (!first) return null
  const latitude = parseFloat(first.lat)
  const longitude = parseFloat(first.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return { latitude, longitude }
}

// Şehir merkezi etrafında 8km yarıçapta müze/tarihi yer/gezi noktası ara.
async function fetchOverpassPlaces(latitude: number, longitude: number): Promise<TouristPlace[]> {
  const query = `[out:json][timeout:25];(node["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"](around:8000,${latitude},${longitude});node["historic"~"monument|castle|memorial|ruins|fort"](around:8000,${latitude},${longitude}););out center 30;`
  const res = await fetchWithTimeout(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!res.ok) throw new Error(`Overpass responded ${res.status}`)
  const data = await res.json()
  const elements: unknown[] = Array.isArray(data?.elements) ? data.elements : []
  return elements
    .filter(
      (el: any) =>
        el?.tags?.name && typeof el.lat === 'number' && typeof el.lon === 'number'
    )
    .map((el: any) => ({
      name: el.tags.name as string,
      latitude: el.lat as number,
      longitude: el.lon as number,
      category: (el.tags.tourism || el.tags.historic || null) as string | null,
    }))
}

// Supabase tourist_cache: 24 saat TTL. Cache taze ise ondan döner, değilse
// Nominatim (geocode) + Overpass (yer listesi) çağırıp cache'e yazar.
// Best-effort: canlı çağrı başarısız olursa eski (stale) cache varsa onu döner,
// hiç yoksa null döner — hotels endpoint'i bu durumda mesafesiz devam eder.
export async function getTouristPlaces(city: string, country: string): Promise<TouristData | null> {
  const key = cacheKey(city, country)
  const now = Date.now()

  const { data: row, error } = await supabaseAdmin
    .from('tourist_cache')
    .select('places_json, city_lat, city_lng, created_at')
    .eq('city', key)
    .maybeSingle()

  if (error) console.error('tourist_cache select error:', error.message)

  const isFresh = !!row && now - new Date(row.created_at).getTime() < CACHE_TTL_MS
  if (isFresh && row!.city_lat != null && row!.city_lng != null) {
    return {
      cityCenter: { latitude: row!.city_lat, longitude: row!.city_lng },
      places: row!.places_json as TouristPlace[],
    }
  }

  try {
    const center = await geocodeCity(city, country)
    if (!center) throw new Error('geocode returned no result')
    const places = await fetchOverpassPlaces(center.latitude, center.longitude)

    // best-effort yazım — başarısız olsa da kullanıcıyı durdurma
    supabaseAdmin
      .from('tourist_cache')
      .upsert({
        city: key,
        places_json: places,
        city_lat: center.latitude,
        city_lng: center.longitude,
        created_at: new Date(now).toISOString(),
      })
      .then(({ error: upsertError }) => {
        if (upsertError) console.error('tourist_cache upsert error:', upsertError.message)
      })

    return { cityCenter: center, places }
  } catch (err) {
    console.error('Tourist places fetch failed:', err instanceof Error ? err.message : err)
    if (row && row.city_lat != null && row.city_lng != null) {
      return {
        cityCenter: { latitude: row.city_lat, longitude: row.city_lng },
        places: row.places_json as TouristPlace[],
      }
    }
    return null
  }
}
