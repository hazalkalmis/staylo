import type { MetadataRoute } from 'next'

// ----------------------------------------------------------------------------
// /robots.txt — Next.js resmi yöntemi. Sitemap referansı + tarama kuralları.
// Disallow: /saved (auth-gated), /api/ (uç noktalar), /auth/ (oauth callback).
// Diğer public sayfalar taranabilir. Base = kanonik canlı domain.
// ----------------------------------------------------------------------------
const SITE_URL = 'https://staylo.tech'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/saved', '/api/', '/auth/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
