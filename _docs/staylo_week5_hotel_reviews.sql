-- ============================================================
-- STAYLO — Hafta 5 adım 3: hotel_reviews (birikimli yorum havuzu)
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- Neden ayrı tablo: Google (max 5+5) ve Tripadvisor (Discover'da 2-3) geçmişe
-- TOPLU erişim vermiyor — zengin havuz ancak ZAMANLA biriktirilerek kurulabilir.
-- Her tazelemede en yeni yorumlar UPSERT edilir; çakışan review_key atlanır,
-- havuz büyür. Gemini skorlaması snapshot yerine bu birikmiş havuzu kullanır.
--
-- review_key (kompozit PK ile birlikte kaynak-içi benzersiz):
--   google      → "author_url|time"  (Google'da yorum ID'si yok; bu ikili
--                  fiilen benzersiz: yorumcu profili + saniyelik unix zamanı)
--   tripadvisor → yorum "id" (Terra benzersiz ID döndürüyor)
--
-- ⚠️ RLS: service_role only (tourist_cache / hotel_photo_cache / hotel_analysis
-- ile aynı desen). Yorum metni asla tarayıcıya inmez (sadece server→Gemini) —
-- Tripadvisor "review text sayfa kaynağında görünmesin" politikasıyla uyumlu.
-- ============================================================

create table if not exists public.hotel_reviews (
  source       text not null,                 -- 'google' | 'tripadvisor'
  review_key   text not null,                 -- google: author_url|time ; tripadvisor: id
  hotel_id     text not null,                 -- Nuitee hotel id
  rating       numeric,                       -- 1-5
  text         text,
  review_date  timestamptz,
  sentiment    text,                          -- ileride Gemini per-review dolduracak (şimdilik null)
  created_at   timestamptz not null default now(),
  primary key (source, review_key)
);

-- "Bir otelin tüm havuzunu getir" sorgusu için
create index if not exists idx_hotel_reviews_hotel on public.hotel_reviews(hotel_id);

alter table public.hotel_reviews enable row level security;
-- Policy yok = tamamen kapalı, sadece service_role erişir
grant select, insert, update, delete on public.hotel_reviews to service_role;
