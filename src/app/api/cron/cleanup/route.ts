import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

// ============================================================================
// Hafta 7 — KVKK otomatik temizlik. Vercel Cron her gün bu route'u GET'ler
// (bkz. vercel.json), Vercel isteğe otomatik `Authorization: Bearer
// $CRON_SECRET` header'ı ekler — biz burada doğrularız (aşağıdaki gibi
// yanlış/eksik secret ile çağrılırsa 401, herkes tetikleyemesin).
//
// Silinenler:
//  - searches: created_at 30 günden eski olanlar (arama geçmişi/KVKK)
//  - rate_limits: updated_at 24 saatten eski olanlar (IP verisi) — aktif bir
//    ban en fazla banMs (şu an 1 saat) sürdüğü için 24 saat eşiği güvenli:
//    banned_until her zaman updated_at'ten en fazla ~1 saat ileride olur.
// ============================================================================

const SEARCHES_RETENTION_MS = 30 * 24 * 60 * 60_000
const RATE_LIMITS_RETENTION_MS = 24 * 60 * 60_000

// Timing-attack korumalı karşılaştırma: farklı uzunlukta erken false döner
// (timingSafeEqual eşit-olmayan-uzunlukta throw eder), eşit uzunlukta ise
// süresi girdi içeriğine bağlı olmayan gerçek sabit-zamanlı karşılaştırma yapılır.
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET
  if (!expected || !auth || !safeCompare(auth, `Bearer ${expected}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = Date.now()
  const searchesCutoff = new Date(now - SEARCHES_RETENTION_MS).toISOString()
  const rateLimitsCutoff = new Date(now - RATE_LIMITS_RETENTION_MS).toISOString()

  const [searchesRes, rateLimitsRes] = await Promise.all([
    supabaseAdmin.from('searches').delete({ count: 'exact' }).lt('created_at', searchesCutoff),
    supabaseAdmin.from('rate_limits').delete({ count: 'exact' }).lt('updated_at', rateLimitsCutoff),
  ])

  if (searchesRes.error) console.error('cleanup: searches delete error:', searchesRes.error.message)
  if (rateLimitsRes.error) console.error('cleanup: rate_limits delete error:', rateLimitsRes.error.message)

  return NextResponse.json({
    ok: !searchesRes.error && !rateLimitsRes.error,
    searchesDeleted: searchesRes.count ?? null,
    rateLimitsDeleted: rateLimitsRes.count ?? null,
    ranAt: new Date(now).toISOString(),
  })
}
