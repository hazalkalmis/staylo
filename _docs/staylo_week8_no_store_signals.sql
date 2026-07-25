-- ============================================================================
-- STAYLO — Hafta 8: No-store review scoring (incremental EMA + opaque dedup)
-- ----------------------------------------------------------------------------
-- UYGULAMA SIRASI (elle, Supabase SQL Editor):
--   1) AŞAMA A (aşağıda) → çalıştır: processed_reviews tablosu + signal_agg kolonu
--   2) Migration script'i çalıştır (seed-prior + hash'leme):
--        node --env-file=.env.local scripts/migrate-signal-agg.mjs
--      (.env.local'e önce REVIEW_DEDUP_PEPPER ekle — uzun rastgele string)
--   3) Script "DONE + drift=0" raporladıktan SONRA AŞAMA B → çalıştır: eski tabloyu düşür
-- ============================================================================


-- ===== AŞAMA A — önce çalıştır ==============================================

-- 1) Dedup defteri — 6b-yalın. SADECE server-gizli PEPPER'lı opak hash.
--    Yorumun kimliği/tarihi/kendi katkısı HİÇ saklanmaz → seyrek-gün korelasyonu kapalı.
create table if not exists public.processed_reviews (
  hotel_id    text not null,
  dedup_hash  text not null,   -- sha256(PEPPER | 'google' | author_url|time), hex
  created_at  timestamptz not null default now(),
  primary key (hotel_id, dedup_hash)
);

-- ⚠️ RLS: service_role only (anon/authenticated erişemez; sistem tablosu).
alter table public.processed_reviews enable row level security;
grant select, insert, delete on public.processed_reviews to service_role;

-- 2) EMA aggregate katmanı — hotel_analysis'e jsonb kolon.
--    signal_agg = {
--      "criteria": { "cleanliness": {"emaSum":.., "emaCount":..}, ... (7: 6+staff) },
--      "aspects":  { "room_smell": {"emaSum":.., "emaCount":..},  ... (19'a kadar) },
--      "dist":     {"pos":.., "neg":.., "neu":..},   -- sönümlü rating dağılımı
--      "reviewCount": <int>,                          -- sönümsüz toplam (poolSize)
--      "lastUpdated": "<iso>"                          -- decay bundan hesaplanır
--    }
alter table public.hotel_analysis add column if not exists signal_agg jsonb;


-- ===== AŞAMA B — SADECE migration script "drift=0" dedikten SONRA ============
-- Kimlik-taşıyan (review_key = author_url|time DÜZ METİN) eski havuzu emekliye ayır.
-- Bu, author_url'in düz metin durduğu mevcut açığı da kapatır.
--
--   drop table if exists public.hotel_reviews;
--
-- (Yorum satırını aç ve çalıştır. Script'i çalıştırmadan ÖNCE düşürme —
--  script eski review_key'leri processed_reviews'a hash'leyerek dedup sürekliliğini
--  kurar; önce düşürürsen mevcut yorumlar yeniden sayılır/çift işlenir.)
-- ============================================================================
