# STAYLO — Hafta 1 Kurulum Kılavuzu

## 1. Proje Oluşturma

```bash
npx create-next-app@14 staylo \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd staylo
```

## 2. Bağımlılıklar

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  mapbox-gl \
  @anthropic-ai/sdk \
  resend \
  zod

npm install -D @types/mapbox-gl
```

## 3. Klasör Yapısı

```
staylo/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout, font yükleme
│   │   ├── page.tsx                    # → /search (redirect)
│   │   ├── (marketing)/
│   │   │   └── page.tsx                # Landing page
│   │   ├── search/
│   │   │   └── page.tsx                # Ekran 1: Onboarding / Search
│   │   ├── filters/
│   │   │   └── page.tsx                # Ekran 2: Filter confirm
│   │   ├── results/
│   │   │   └── page.tsx                # Ekran 3: Results list
│   │   ├── map/
│   │   │   └── page.tsx                # Ekran 4: Map view
│   │   ├── hotel/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Ekran 5: Hotel detail
│   │   ├── go/
│   │   │   └── page.tsx                # Booking yönlendirme (UTM)
│   │   ├── profile/
│   │   │   └── page.tsx                # Kullanıcı profili
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts            # OAuth callback
│   │   │   └── confirm/
│   │   │       └── route.ts            # Email confirm
│   │   └── api/
│   │       ├── search/
│   │       │   └── route.ts            # POST: NL → filtreler (Claude Haiku)
│   │       ├── hotels/
│   │       │   └── route.ts            # POST: Booking API sorgusu
│   │       ├── analyze/
│   │       │   └── route.ts            # POST: Yorum analizi (Claude Sonnet)
│   │       ├── places/
│   │       │   └── route.ts            # GET: Google Places (turistik noktalar)
│   │       ├── safety/
│   │       │   └── route.ts            # GET: Numbeo güvenlik skoru
│   │       ├── click/
│   │       │   └── route.ts            # POST: UTM tıklama logu
│   │       └── user/
│   │           ├── favorites/
│   │           │   └── route.ts        # GET/POST/DELETE: Favoriler
│   │           └── searches/
│   │               └── route.ts        # GET/DELETE: Arama geçmişi
│   ├── components/
│   │   ├── ui/                         # Primitive bileşenler
│   │   │   ├── ScoreBadge.tsx          # Staylo score badge (sharp corners)
│   │   │   ├── Btn.tsx                 # Button variants
│   │   │   ├── Chip.tsx                # Example chips
│   │   │   ├── Card.tsx                # Base card
│   │   │   └── Scribble.tsx            # Amber underline accent
│   │   ├── layout/
│   │   │   ├── TopNav.tsx              # Navigation
│   │   │   ├── Sidebar.tsx             # Sol sidebar (geçmiş aramalar)
│   │   │   └── RightPanel.tsx          # Sağ panel (weights, collapsible)
│   │   ├── search/
│   │   │   ├── SearchBox.tsx           # Ana NL arama kutusu
│   │   │   └── ExampleChips.tsx        # Örnek aramalar
│   │   ├── filters/
│   │   │   ├── FilterCard.tsx          # Düzenlenebilir filtre kartı
│   │   │   ├── WeightSlider.tsx        # Ağırlık slider'ı
│   │   │   └── CriteriaPanel.tsx       # Sağ panel, 2 tab
│   │   ├── results/
│   │   │   ├── HotelCard.tsx           # Sonuç listesi otel kartı
│   │   │   ├── ReviewSummary.tsx       # AI yorum özeti
│   │   │   └── SafetyScore.tsx         # Güvenlik skoru
│   │   ├── map/
│   │   │   ├── MapView.tsx             # Mapbox wrapper
│   │   │   ├── HotelPin.tsx            # Otel pin (score + fiyat)
│   │   │   └── PoiPin.tsx              # Turistik nokta pin (diamond)
│   │   └── hotel/
│   │       ├── ScoreBreakdown.tsx      # Kriter bazlı skor barları
│   │       ├── ReviewThemes.tsx        # AI tema + mention count
│   │       └── DistanceList.tsx        # Turistik noktalara mesafe
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser client
│   │   │   ├── server.ts               # Server client (SSR)
│   │   │   └── middleware.ts           # Session yönetimi
│   │   ├── claude/
│   │   │   ├── extract-filters.ts      # NL → JSON (Haiku)
│   │   │   └── analyze-reviews.ts      # Yorum analizi (Sonnet)
│   │   ├── booking/
│   │   │   └── search.ts               # Booking API wrapper
│   │   ├── scoring/
│   │   │   ├── normalize.ts            # 0–10 normalize
│   │   │   └── weighted-average.ts     # Ağırlıklı ortalama
│   │   ├── geo/
│   │   │   └── haversine.ts            # Kuş uçuşu mesafe
│   │   ├── cache/
│   │   │   └── ttl.ts                  # 24h TTL cache kontrolü
│   │   ├── rate-limit/
│   │   │   └── ip-limiter.ts           # IP bazlı rate limit
│   │   └── utm/
│   │       └── build-link.ts           # UTM parametreli link
│   ├── types/
│   │   ├── hotel.ts                    # Hotel, HotelScore, HotelAnalysis
│   │   ├── filters.ts                  # SearchFilters, Criterion, Weight
│   │   └── supabase.ts                 # DB tipler (generated)
│   └── middleware.ts                   # Auth + rate limit middleware
├── public/
│   └── fonts/                          # Geist + Instrument Serif (Google'dan)
├── .env.local                          # ⚠️ ASLA COMMIT ETME
├── .gitignore
├── next.config.ts
└── tailwind.config.ts
```

---

## 4. .gitignore Kontrolü

`.gitignore` dosyasında şunların olduğunu doğrula:

```
.env.local
.env*.local
.env
```

⚠️ **GÜVENLİK:** `git add .` yapmadan önce `git status` ile kontrol et. `.env.local` görünüyorsa dur.

---

## 5. next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Booking.com görselleri
      { protocol: 'https', hostname: '*.bstatic.com' },
      { protocol: 'https', hostname: '*.booking.com' },
      // Google Places görselleri
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // API key'lerin client'a sızmaması için
  // NEXT_PUBLIC_ prefix olmayan her şey server-only
}

export default nextConfig
```

---

## 6. Tailwind + CSS Tokens

`src/app/globals.css` içine Staylo design token'larını ekle:

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap');

:root {
  /* Surfaces */
  --bg: #FAF7F2;
  --surface: #FFFFFF;
  --surface-2: #FBF8F2;
  --border: #E8E2D6;
  --border-strong: #D9D0BD;

  /* Type */
  --text: #4A3F32;
  --ink-strong: #2F271E;
  --muted: #8A8275;
  --faint: #B8B0A2;

  /* Brand */
  --accent: #8FB8A8;
  --accent-deep: #5A8C7A;
  --accent-soft: #D9EAE2;
  --amber: #E8B14F;
  --terra: #C5604E;

  /* Score semantic */
  --good: #4F9E6A;
  --warn: #D4A23A;
  --bad: #C5604E;

  /* Font */
  --font: 'Geist', system-ui, -apple-system, sans-serif;
  --font-serif: 'Instrument Serif', Georgia, serif;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
}
```

---

## 7. Kontrol Listesi

Hafta 1 bitişinde şunları doğrula:

- [ ] `git log` — `.env.local` hiç commit edilmedi
- [ ] Vercel dashboard → Environment Variables → tüm key'ler var
- [ ] Supabase → Authentication → Email + Google OAuth aktif
- [ ] Supabase → Table Editor → RLS tüm tablolarda "Enabled"
- [ ] `npm run build` → sıfır hata
- [ ] Vercel'de canlı URL çalışıyor (landing page)
