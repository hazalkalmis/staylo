import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ============================================================================
// Hafta 7 — Auth callback. Hem Google OAuth hem magic link (PKCE) buraya
// ?code=... ile döner. code'u session'a çeviririz ve `next`'e yönlendiririz.
//
// ⚠️ Cookie deseni: exchangeCodeForSession'ın yazdığı session cookie'lerini
// DOĞRUDAN redirect response'una bağlıyoruz (createServerClient'a bu response'a
// yazan bir cookie adapter'ı veriyoruz) — böylece cookie'ler kesin olarak
// yanıtta taşınır (middleware'deki aynı sağlam desen).
// ============================================================================

function safeNext(next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next
  return '/saved'
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const response = NextResponse.redirect(`${origin}${next}`)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('auth callback exchange error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  return response
}
