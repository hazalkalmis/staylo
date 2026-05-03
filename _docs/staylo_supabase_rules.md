# STAYLO — Supabase Kullanım Minimizasyon Kuralları
## Her kod yazımında bu kurallara uy. İstisna yok.

---

## 1. Görseller asla Supabase'den gitmez
- Otel fotoğrafları → Booking.com URL'i direkt kullan
- Turistik yer fotoğrafları → Google Places URL'i direkt kullan
- Supabase sadece URL string'i saklar, görselin kendisini asla

## 2. Cache süreleri
- **Yorum analizi (hotel_analysis):** 72 saat TTL
- **Turistik yerler (tourist_cache):** 24 saat TTL
- **Rate limit kayıtları:** 1 dakika / 1 gün window
- **IP hash'leri:** 24 saat sonra null'a çek

## 3. Sadece gerekli kolonları çek — asla SELECT *
```typescript
// ❌ YAPMA
const { data } = await supabase.from('hotels').select('*')

// ✅ YAP
const { data } = await supabase.from('searches').select('id, query, city, created_at')
```

## 4. Pagination — bir anda max 20 kayıt
```typescript
const { data } = await supabase
  .from('searches')
  .select('id, query, city, created_at')
  .order('created_at', { ascending: false })
  .limit(20)
```

## 5. In-memory cache — aynı oturumda tekrar Supabase'e gitme
```typescript
// Basit in-memory cache pattern
const cache = new Map<string, { data: any; expires: number }>()

function getCached(key: string) {
  const item = cache.get(key)
  if (item && item.expires > Date.now()) return item.data
  return null
}

function setCached(key: string, data: any, ttlMs: number) {
  cache.set(key, { data, expires: Date.now() + ttlMs })
}
```

## 6. 72 saat TTL kontrolü — yorum analizi
```typescript
// hotel_analysis tablosunda cache kontrolü
const { data: cached } = await supabase
  .from('hotel_analysis')
  .select('analysis_json')
  .eq('hotel_id', hotelId)
  .gt('created_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
  .single()

if (cached) return cached.analysis_json  // Cache hit → Supabase'e tekrar gitme
// Cache miss → Claude'a git, sonucu kaydet
```

## 7. Realtime kapalı — polling yok
- Supabase Realtime özelliği kullanılmıyor
- Otomatik subscription yok
- Veri sadece kullanıcı aksiyon aldığında çekilir

## 8. Supabase Storage kullanılmıyor
- Dosya yükleme yok
- Avatar yok
- Egress sıfır bu kanaldan

---

## Hangi aşamada uygulanır?
| Kural | Uygulama Haftası |
|-------|-----------------|
| SELECT kolonları | Her kod yazımında — Hafta 2'den itibaren |
| Pagination | Hafta 3 — Results list |
| Görsel URL'leri | Hafta 3 — Booking API entegrasyonu |
| 72h cache (yorum) | Hafta 4 — Yorum analizi |
| 24h cache (turistik) | Hafta 6 — Google Places |
| In-memory cache | Hafta 4+ — Her cache fonksiyonunda |
| IP hash temizlik | Hafta 5 — Auth + KVKK |
