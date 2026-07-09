import 'server-only'

// ----------------------------------------------------------------------------
// Cloudflare Turnstile — honeypot'un ÜSTÜNE ikinci bot koruması katmanı.
// Widget /search sayfasında (managed mode) token üretir, biz burada
// siteverify ile server-side doğrularız.
//
// Fail-safe kuralları (mevcut projedeki fail-open desenlerle tutarlı):
//  - TURNSTILE_SECRET_KEY env'i yoksa (ör. yerel geliştirme) → doğrulamayı
//    ATLA (fail-open). Honeypot yine de birinci katman olarak çalışır.
//  - Cloudflare'e ağ hatası/timeout → fail-open + hata logla (Cloudflare
//    kesintisi yüzünden arama tamamen durmasın; honeypot zaten devrede).
//  - Cloudflare açıkça "success: false" derse → fail-CLOSED (reddet).
//    Bu, gerçek bir bot/geçersiz token tespiti — atlanmaz.
// ----------------------------------------------------------------------------

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const FETCH_TIMEOUT_MS = 8_000

export async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // yapılandırılmamış — fail-open

  if (!token) return false // secret var ama client token göndermedi → reddet

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: remoteIp }),
      signal: controller.signal,
    })
    if (!res.ok) {
      console.error('Turnstile siteverify responded', res.status)
      return true // upstream hatası — fail-open
    }
    const data = await res.json()
    if (!data.success) {
      console.error('Turnstile verify failed:', JSON.stringify(data['error-codes'] ?? []))
      return false
    }
    return true
  } catch (err) {
    console.error('Turnstile verify threw:', err instanceof Error ? err.message : err)
    return true // ağ hatası/timeout — fail-open
  } finally {
    clearTimeout(timeout)
  }
}
