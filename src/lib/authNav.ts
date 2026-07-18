import { createClient } from '@/lib/supabase/client'

// ----------------------------------------------------------------------------
// Hafta 7 — Nav auth-durumu. Sayfalar büyük HTML string olarak render edildiği
// için (client component + dangerouslySetInnerHTML), nav'daki ".login" linkini
// mount sonrası burada DOM üzerinden güncelliyoruz:
//   - girişli:  "Log out" (tıklayınca signOut + '/'e dön)
//   - girişsiz: "Log in" → /login
// "Saved" linki HTML'de statik /saved'e gider (girişsizse middleware /login'e atar).
// Best-effort: hata olsa da nav bozulmaz (link default haliyle kalır).
// ----------------------------------------------------------------------------
export async function wireAuthNav(): Promise<void> {
  const loginEl = document.querySelector('nav .login') as HTMLAnchorElement | null
  if (!loginEl) return

  // Girişsiz "Log in" linki, kullanıcıyı bulunduğu sayfaya geri döndürmek için
  // mevcut path'i ?next= olarak taşır (kalp butonu / /saved guard ile tutarlı).
  // Sadece güvenli iç path (open-redirect önleme); /login'in kendisini taşımayız.
  const path = window.location.pathname
  const loginHref =
    path && path.startsWith('/') && !path.startsWith('//') && path !== '/login'
      ? `/login?next=${encodeURIComponent(path)}`
      : '/login'

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      loginEl.textContent = 'Log out'
      loginEl.setAttribute('href', '#')
      loginEl.addEventListener('click', async (e) => {
        e.preventDefault()
        try {
          await supabase.auth.signOut()
        } catch {}
        window.location.href = '/'
      })
    } else {
      loginEl.setAttribute('href', loginHref)
    }
  } catch {
    // sessiz — girişsiz varsayıp /login'e bırak
    loginEl.setAttribute('href', '/login')
  }
}
