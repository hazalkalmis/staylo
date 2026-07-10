import 'server-only'
import { Resend } from 'resend'

// ----------------------------------------------------------------------------
// Ortak alert e-posta gönderici — Hafta 7. staylo.tech domaini Resend'de
// doğrulanmış (SPF/DKIM). Her zaman best-effort: hata durumunda throw ETMEZ,
// sadece loglar — bir e-posta gönderim hatası hiçbir kullanıcı akışını
// (arama, rate limit vb.) bloklamamalı. Bu dosyanın diğer alert kullanımlarıyla
// (apiUsage.ts, rateLimit.ts) aynı fail-safe deseni.
// ----------------------------------------------------------------------------

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = `Staylo Alerts <${process.env.ALERT_FROM_EMAIL || 'alerts@staylo.tech'}>`

export async function sendAlertEmail(to: string, subject: string, text: string): Promise<void> {
  if (!resend) {
    console.error('RESEND_API_KEY yok — alert e-postası atlandı:', subject)
    return
  }
  if (!to) {
    console.error('Alert e-postası alıcısı yok — atlandı:', subject)
    return
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, text })
    if (error) console.error('Resend gönderim hatası:', error.message ?? error)
  } catch (err) {
    console.error('Resend gönderimi throw etti:', err instanceof Error ? err.message : err)
  }
}
