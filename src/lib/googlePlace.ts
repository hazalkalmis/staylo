import 'server-only'

// Ortak Google Places (New) çözümleyici — Text Search (New) ile TEK çağrıda
// place id + foto resource adı döner. Foto URL'i ayrıca skipHttpRedirect ile
// ÖNCEDEN İMZALI photoUri olarak alınır (bkz. resolvePhotoUri) — bu URL API key
// İÇERMEZ, doğrudan tarayıcıya verilir. Böylece tarayıcıya hiç key inmez →
// referrer restriction derdi ortadan kalkar, sadece server key yeterli.
//
// hotelPhotos.ts (foto fallback) ve hotelAnalysis.ts (yorum/puan için place id)
// aynı çözümleyiciyi paylaşır. Kısa ömürlü in-memory memoization ile aynı
// istek/oturum içinde tekrar Google'a gidilmez.

const SEARCH_TEXT_URL = 'https://places.googleapis.com/v1/places:searchText'
const PLACES_V1_BASE = 'https://places.googleapis.com/v1'
const FETCH_TIMEOUT_MS = 10_000
const MEMO_TTL_MS = 5 * 60_000
const PHOTO_MAX_WIDTH_PX = 800

export type GooglePlaceRef = {
  placeId: string
  // Places API (New) foto resource adı: "places/XXX/photos/YYY".
  // Ön-imzalı photoUri'ye çevirmek için resolvePhotoUri() kullan.
  photoName: string | null
}

const memo = new Map<string, { data: GooglePlaceRef | null; expires: number }>()

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

// name+address → { placeId, photoName } | null (eşleşme yoksa).
// Hata durumunda throw eder — çağıranlar kendi best-effort mantığını uygular.
export async function findGooglePlace(
  name: string,
  address: string | null
): Promise<GooglePlaceRef | null> {
  const serverKey = process.env.GOOGLE_PLACES_SERVER_KEY
  if (!serverKey) return null

  const query = [name, address].filter(Boolean).join(', ')
  const cached = memo.get(query)
  if (cached && cached.expires > Date.now()) return cached.data

  // Text Search (New): FieldMask ile SADECE id + photos iste (maliyet SKU'sunu sınırlar).
  const res = await fetchWithTimeout(SEARCH_TEXT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': serverKey,
      'X-Goog-FieldMask': 'places.id,places.photos',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
  })
  if (!res.ok) throw new Error(`Places searchText responded ${res.status}`)
  const data = await res.json()

  const place = data.places?.[0]
  const result: GooglePlaceRef | null = place?.id
    ? { placeId: place.id, photoName: place.photos?.[0]?.name ?? null }
    : null

  memo.set(query, { data: result, expires: Date.now() + MEMO_TTL_MS })
  return result
}

// Foto resource adını ÖNCEDEN İMZALI photoUri'ye çevirir (Place Photos New +
// skipHttpRedirect=true). Dönen photoUri lh3.googleusercontent.com CDN linkidir —
// API key İÇERMEZ, doğrudan tarayıcıya verilir. Hata durumunda throw (best-effort
// çağıran ele alır); foto adı yoksa null.
export async function resolvePhotoUri(photoName: string | null): Promise<string | null> {
  const serverKey = process.env.GOOGLE_PLACES_SERVER_KEY
  if (!serverKey || !photoName) return null

  // skipHttpRedirect=true → redirect yerine JSON { name, photoUri } döner.
  const url = `${PLACES_V1_BASE}/${photoName}/media?maxWidthPx=${PHOTO_MAX_WIDTH_PX}&skipHttpRedirect=true`
  const res = await fetchWithTimeout(url, { headers: { 'X-Goog-Api-Key': serverKey } })
  if (!res.ok) throw new Error(`Places photo media responded ${res.status}`)
  const data = await res.json()
  return typeof data.photoUri === 'string' ? data.photoUri : null
}
