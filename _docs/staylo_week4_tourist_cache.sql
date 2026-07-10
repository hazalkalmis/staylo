-- ============================================================
-- STAYLO — Hafta 4: tourist_cache düzeltmesi
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- ⚠️ Bu tablo aslında Hafta 1'de staylo_schema.sql ile zaten oluşturulmuş
-- (Google Places için tasarlanmıştı, hiç kullanılmadı). Bu migration onu
-- düzeltiyor:
--  1) service_role'e hiç GRANT verilmemiş — REST üzerinden "permission
--     denied for table tourist_cache" hatası alınıyordu. Bu yüzden GRANT
--     ekleniyor.
--  2) Eski policy "Herkes turistik yerleri okuyabilir" (using true) —
--     artık istenen "service_role only" ile çelişiyor, kaldırılıyor.
--  3) city_lat/city_lng kolonları yoktu — otelin şehir merkezine mesafesini
--     hesaplamak için gerekli, ekleniyor.
--
-- ⚠️ `city` PK'nin değeri normalize edilmiş bir composite key
-- (ör. "istanbul|turkey") — aynı isimli şehirlerin farklı ülkelerde
-- çakışmasını önlemek için. Kolon adı yine `city`.
-- ============================================================

create table if not exists public.tourist_cache (
  city         text primary key,
  places_json  jsonb not null,
  created_at   timestamptz not null default now()
);

alter table public.tourist_cache add column if not exists city_lat double precision;
alter table public.tourist_cache add column if not exists city_lng double precision;

-- Eski "herkese açık" policy'yi kaldır — artık service_role only
drop policy if exists "Herkes turistik yerleri okuyabilir" on public.tourist_cache;

-- RLS açık kalsın, policy yok = tamamen kapalı, sadece service_role erişir
alter table public.tourist_cache enable row level security;

-- service_role'e tablo düzeyinde eksik yetkileri ver (RLS'den ayrı bir katman)
grant select, insert, update, delete on public.tourist_cache to service_role;
