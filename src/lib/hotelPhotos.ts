import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { findGooglePlace, resolvePhotoUri } from '@/lib/googlePlace'

const CACHE_TTL_MS = 24 * 60 * 60_000

// Otel adı + adresle Google Places (New)'te eşleşen ilk yeri bulur, foto varsa
// skipHttpRedirect ile ÖNCEDEN İMZALI photoUri'yi döner (key içermez) — görsel
// bizim üzerimizden geçmez, tarayıcı doğrudan Google CDN'inden yükler (bandwidth
// kuralı) ve URL'de key olmadığı için referrer sorunu da yoktur.
// Yer çözümleme ortak findGooglePlace()'te (bkz. googlePlace.ts) — hotelAnalysis.ts
// place id için aynı çağrıyı paylaşır (o foto URI'sine ihtiyaç duymaz).
async function findGooglePhotoUrl(name: string, address: string | null): Promise<string | null> {
  const place = await findGooglePlace(name, address)
  if (!place?.photoName) return null
  return await resolvePhotoUri(place.photoName)
}

// Supabase hotel_photo_cache: 24 saat TTL. Cache taze ise (foto bulunamamış
// olsa bile) ondan döner, değilse Google Places'e sorar ve sonucu (null dahil)
// cache'ler. Best-effort: canlı çağrı başarısız olursa eski cache'e, o da
// yoksa null'a düşer — hotels endpoint'i bu durumda placeholder gösterir.
export async function getHotelPhotoUrl(
  hotelId: string,
  name: string,
  address: string | null
): Promise<string | null> {
  const now = Date.now()

  const { data: row, error } = await supabaseAdmin
    .from('hotel_photo_cache')
    .select('photo_url, created_at')
    .eq('hotel_id', hotelId)
    .maybeSingle()

  if (error) console.error('hotel_photo_cache select error:', error.message)

  const isFresh = !!row && now - new Date(row.created_at).getTime() < CACHE_TTL_MS
  if (isFresh) return row!.photo_url

  try {
    const photoUrl = await findGooglePhotoUrl(name, address)

    // best-effort yazım (null da dahil — "foto yok" sonucunu da cache'liyoruz,
    // yoksa her istekte tekrar Google'a gidip kota tüketirdik)
    supabaseAdmin
      .from('hotel_photo_cache')
      .upsert({ hotel_id: hotelId, photo_url: photoUrl, created_at: new Date(now).toISOString() })
      .then(({ error: upsertError }) => {
        if (upsertError) console.error('hotel_photo_cache upsert error:', upsertError.message)
      })

    return photoUrl
  } catch (err) {
    console.error('Google Places photo fetch failed:', err instanceof Error ? err.message : err)
    return row ? row.photo_url : null
  }
}
