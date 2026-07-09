import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

// ============================================================================
// Hafta 7 — Gerçek favoriler. Kullanıcının KENDİ session'ı (anon key + JWT) +
// RLS ile erişilir; service_role KULLANILMAZ (bu bir kullanıcı tablosu).
// RLS zaten satırları auth.uid()'e kilitliyor — ayrıca kodda da user.id filtresi
// koyuyoruz (defense-in-depth + niyet açıklığı).
//
// Rate limit: SADECE mutasyonlarda (POST/DELETE) — yeni 'favorites' action'ı.
// GET (okuma) rate-limit'siz: /saved + /results kalp-durumu doldurma sık çağırır,
// per-user RLS ile zaten güvenli ve ucuz.
// insert 23505 (unique çakışması) → sessizce { ok:true } (idempotent toggle).
// ============================================================================

const FAV_RATE_LIMIT = {
  dailyLimit: 300,
  burstLimit: 40,
  burstWindowMs: 60_000,
  banMs: 15 * 60_000,
}

const AddSchema = z.object({
  hotelId: z.string().trim().min(1, 'hotelId required').max(120),
  hotelName: z.string().trim().max(300).nullish(),
  city: z.string().trim().max(200).nullish(),
  country: z.string().trim().max(200).nullish(),
  photoUrl: z.string().trim().url().max(2000).nullish(),
  priceAmount: z.number().nonnegative().max(10_000_000).nullish(),
  priceCurrency: z.string().trim().max(8).nullish(),
  fitScore: z.number().min(0).max(10).nullish(),
})

async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

// GET — giriş yapmış kullanıcının favorileri (en yeni önce).
export async function GET() {
  const { supabase, user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('favorites select error:', error.message)
    return NextResponse.json({ error: 'Could not load favorites' }, { status: 500 })
  }
  return NextResponse.json({ favorites: data ?? [] })
}

// POST — favori ekle (idempotent: zaten varsa sessiz başarı).
export async function POST(request: NextRequest) {
  const rl = await checkRateLimit(getClientIp(request), 'favorites', FAV_RATE_LIMIT)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

  const { supabase, user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = await request.json().catch(() => null)
  const parsed = AddSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
  }
  const d = parsed.data

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    hotel_id: d.hotelId,
    hotel_name: d.hotelName ?? null,
    city: d.city ?? null,
    country: d.country ?? null,
    photo_url: d.photoUrl ?? null,
    price_amount: d.priceAmount ?? null,
    price_currency: d.priceCurrency ?? null,
    fit_score: d.fitScore ?? null,
  })

  if (error) {
    // 23505 = unique_violation (user_id + hotel_id zaten favoride) → idempotent başarı.
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ ok: true, already: true })
    }
    console.error('favorites insert error:', error.message)
    return NextResponse.json({ error: 'Could not save favorite' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

// DELETE — favori kaldır (?hotelId=...).
export async function DELETE(request: NextRequest) {
  const rl = await checkRateLimit(getClientIp(request), 'favorites', FAV_RATE_LIMIT)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

  const { supabase, user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = (request.nextUrl.searchParams.get('hotelId') || '').trim()
  if (!hotelId) return NextResponse.json({ error: 'hotelId required' }, { status: 400 })

  const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('hotel_id', hotelId)
  if (error) {
    console.error('favorites delete error:', error.message)
    return NextResponse.json({ error: 'Could not remove favorite' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
