import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/rateLimit'

// ============================================================================
// Hafta 6 — Booking yönlendirme + komisyon/attribution takibi.
//
// Akış: kart "View on Booking" → GET /api/redirect?... → click_logs'a yaz →
// gerçek Booking.com deep-link'ine 302. target=_blank YOK (aynı sekmede gider).
//
// ⚠️ Affiliate ağı (CJ/Expedia) onayı HENÜZ Pending. Kod ağdan bağımsız:
//   - AFFILIATE_LINK_TEMPLATE: içinde {url} placeholder'ı olan sarmalayıcı link
//       (ör. "https://www.anrdoezrs.net/links/123/type/dlg/{url}").
//       {url} → Booking deep-link'inin URL-encoded hali ile değiştirilir.
//   - Boş/tanımsız/hatalı ise → düz Booking.com linkine düşer (FAIL-SAFE).
//         Komisyon linki gelmeden de site tam çalışır.
//   - AFFILIATE_NETWORK: log'a yazılan ağ etiketi ('cj'|'expedia'|null).
// Ağ netleşince SADECE bu env'ler doldurulur; kod değişmez.
// ============================================================================

const BOOKING_SEARCH_URL = 'https://www.booking.com/searchresults.html'

// Attribution için sabit UTM'ler — hem Booking URL'ine eklenir hem log'lanır.
const UTM = { source: 'staylo', medium: 'referral', campaign: 'results_card' } as const

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Booking.com metin-arama deep-link'i (otel adı + şehir + tarih + misafir).
function buildBookingUrl(opts: {
  name: string | null
  city: string | null
  country: string | null
  checkIn: string | null
  checkOut: string | null
  guests: number | null
}): string {
  const params = new URLSearchParams()
  // Booking ID'si Nuitee'de YOK → metin araması. Ülkeyi de ekleyerek çapraz-ülke
  // şehir belirsizliğini (ör. Rome/IT vs Rome/US) azaltıyoruz. Adres/zip eklemiyoruz:
  // Booking'in fuzzy araması aşırı kısıtlanınca oteli sonuçtan düşürebilir.
  const ss = [opts.name, opts.city, opts.country].filter(Boolean).join(' ').trim()
  if (ss) params.set('ss', ss)
  if (opts.checkIn && DATE_RE.test(opts.checkIn)) params.set('checkin', opts.checkIn)
  if (opts.checkOut && DATE_RE.test(opts.checkOut)) params.set('checkout', opts.checkOut)
  if (opts.guests && opts.guests > 0) {
    params.set('group_adults', String(opts.guests))
    params.set('group_children', '0')
    params.set('no_rooms', '1')
  }
  // UTM'ler (Booking bilinmeyen paramları yok sayar ama korur)
  params.set('utm_source', UTM.source)
  params.set('utm_medium', UTM.medium)
  params.set('utm_campaign', UTM.campaign)
  return `${BOOKING_SEARCH_URL}?${params.toString()}`
}

// Affiliate sarmalayıcıyı uygula; template yoksa/hatalıysa düz link (fail-safe).
function applyAffiliate(bookingUrl: string): string {
  const template = process.env.AFFILIATE_LINK_TEMPLATE
  if (!template) return bookingUrl
  if (!template.includes('{url}')) {
    console.warn('AFFILIATE_LINK_TEMPLATE {url} placeholder içermiyor — düz linke düşülüyor')
    return bookingUrl
  }
  return template.replace('{url}', encodeURIComponent(bookingUrl))
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const hotelId = (sp.get('hotel') || '').trim()
  const name = (sp.get('name') || '').trim() || null
  const city = (sp.get('city') || '').trim() || null
  const country = (sp.get('country') || '').trim() || null
  const checkIn = (sp.get('checkIn') || '').trim() || null
  const checkOut = (sp.get('checkOut') || '').trim() || null
  const guestsRaw = Number(sp.get('guests'))
  const guests = Number.isFinite(guestsRaw) && guestsRaw > 0 ? Math.floor(guestsRaw) : null

  const bookingUrl = buildBookingUrl({ name, city, country, checkIn, checkOut, guests })
  const destinationUrl = applyAffiliate(bookingUrl)

  // Tıklamayı logla — best-effort: hata olsa da kullanıcıyı yönlendirmeyi engelleme.
  try {
    const { error } = await supabaseAdmin.from('click_logs').insert({
      hotel_id: hotelId || 'unknown',
      hotel_name: name,
      city,
      affiliate_network: process.env.AFFILIATE_NETWORK || null,
      destination_url: destinationUrl,
      utm_source: UTM.source,
      utm_medium: UTM.medium,
      utm_campaign: UTM.campaign,
      ip: getClientIp(request),
    })
    if (error) console.error('click_logs insert error:', error.message)
  } catch (err) {
    console.error('click_logs insert threw:', err instanceof Error ? err.message : err)
  }

  return NextResponse.redirect(destinationUrl, 302)
}
