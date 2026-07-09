import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

// ============================================================================
// Hafta 7 — Magic link isteği. Tarayıcıdan doğrudan supabase.auth.signInWithOtp
// çağırmak yerine bu route'tan geçiriyoruz ki: (1) Zod ile e-posta doğrulaması,
// (2) IP bazlı rate limit (e-posta bombardımanı/kota tüketimi koruması) yapılsın.
// Turnstile yerine IP rate limit tercih edildi — çok daha az kod (route zaten
// var, checkRateLimit tek çağrı), honeypot+Turnstile arama tarafında zaten mevcut.
// ============================================================================

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(200),
  next: z.string().max(200).optional(),
})

// Magic link abuse koruması: IP başına dakikada 5, günde 20. Ban 30 dk.
const MAGIC_RATE_LIMIT = {
  dailyLimit: 20,
  burstLimit: 5,
  burstWindowMs: 60_000,
  banMs: 30 * 60_000,
}

// next parametresini sadece güvenli iç path'lere sınırla (open-redirect önleme).
function safeNext(next: string | undefined): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next
  return '/saved'
}

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }

  const ip = getClientIp(request)
  const rl = await checkRateLimit(ip, 'auth_magic_link', MAGIC_RATE_LIMIT)
  if (!rl.allowed) {
    const msg =
      rl.reason === 'daily_limit'
        ? 'Too many magic-link requests today. Please try again tomorrow.'
        : 'Too many requests. Please wait a minute and try again.'
    return NextResponse.json({ error: msg, reason: rl.reason }, { status: 429 })
  }

  const { email, next } = parsed.data
  const emailRedirectTo = `${request.nextUrl.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })
  if (error) {
    console.error('magic-link signInWithOtp error:', error.message)
    // Kullanıcı numaralandırmasını önlemek için nazik jenerik mesaj.
    return NextResponse.json({ error: 'Could not send the link right now. Please try again shortly.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
