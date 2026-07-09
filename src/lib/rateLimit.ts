import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendAlertEmail } from '@/lib/email'

export type RateLimitConfig = {
  dailyLimit: number
  burstLimit: number
  burstWindowMs: number
  banMs: number
}

export type RateLimitResult = { allowed: boolean; reason?: 'banned' | 'daily_limit' }

// İstemci IP'sini Vercel header'larından çöz
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

// ----------------------------------------------------------------------------
// Rate limit: Supabase rate_limits tablosunu oku/güncelle.
// `action` her endpoint için ayrı sayaç tutar (ör. 'search', 'hotels').
// Dönen: { allowed: boolean, reason?: string }
// ----------------------------------------------------------------------------
export async function checkRateLimit(
  ip: string,
  action: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  const { dailyLimit, burstLimit, burstWindowMs, banMs } = config

  const { data: row, error: rlError } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('ip', ip)
    .eq('action', action)
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
      action,
      count: 1,
      window_start: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    })
    return { allowed: true }
  }

  const windowStart = new Date(row.window_start).getTime()
  const elapsed = now - windowStart

  // Burst kontrolü: pencere burstWindowMs içindeyse ve sayı burstLimit'i aştıysa → BAN
  if (elapsed < burstWindowMs && row.count + 1 > burstLimit) {
    await supabaseAdmin
      .from('rate_limits')
      .update({
        banned_until: new Date(now + banMs).toISOString(),
        updated_at: new Date(now).toISOString(),
      })
      .eq('ip', ip)
      .eq('action', action)
    // Best-effort: alert e-postası ban'ı engellemez (sendAlertEmail hata yutar, fail-safe).
    void sendAlertEmail(
      'hazalkalmis@gmail.com',
      `[Staylo] IP banlandı: ${ip} (${action})`,
      `IP ${ip}, '${action}' aksiyonunda burst limitini (${burstLimit}/${Math.round(burstWindowMs / 1000)}s) aştığı için ` +
        `${Math.round(banMs / 60_000)} dakika banlandı. Zaman: ${new Date(now).toISOString()}.`
    )
    return { allowed: false, reason: 'banned' }
  }

  // Günlük pencere: 24 saat geçtiyse sayacı sıfırla
  const DAY_MS = 24 * 60 * 60_000
  if (elapsed > DAY_MS) {
    await supabaseAdmin
      .from('rate_limits')
      .update({ count: 1, window_start: new Date(now).toISOString(), updated_at: new Date(now).toISOString() })
      .eq('ip', ip)
      .eq('action', action)
    return { allowed: true }
  }

  // Günlük limit aşıldı mı?
  if (row.count + 1 > dailyLimit) {
    return { allowed: false, reason: 'daily_limit' }
  }

  // Normal: sayacı artır
  await supabaseAdmin
    .from('rate_limits')
    .update({ count: row.count + 1, updated_at: new Date(now).toISOString() })
    .eq('ip', ip)
    .eq('action', action)
  return { allowed: true }
}
