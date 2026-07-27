import type { MetadataRoute } from 'next'

// ----------------------------------------------------------------------------
// /sitemap.xml — Next.js resmi yöntemi (App Router). Yalnız PUBLIC, statik
// landing sayfaları. Dışarıda bırakılanlar: /saved (auth-gated), /results &
// /filters (arama-context'i olmadan /search'e yönlenir, landing değil),
// /login (SEO değeri düşük). Base = kanonik canlı domain (NEXT_PUBLIC_APP_URL
// localde localhost olduğu için sitemap'te sabit kullanılır).
// ----------------------------------------------------------------------------
const SITE_URL = 'https://staylo.tech'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/search`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
