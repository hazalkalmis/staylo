-- ============================================================
-- STAYLO — Hafta 3: /api/hotels için rate_limits migration
-- Supabase SQL Editor'a yapıştır, çalıştır.
-- ⚠️ Not: gerçek deployed rate_limits tablosu staylo_schema.sql'deki
-- tasarımdan farklı (ip_hash/window_end yerine ip/window_start/banned_until
-- kullanılıyor — bkz. src/app/api/search/route.ts). Bu migration mevcut
-- (gerçek) tabloyu baz alır.
-- ============================================================

-- action kolonu: her endpoint için ayrı sayaç (search, hotels, ...)
alter table public.rate_limits
  add column if not exists action text not null default 'search';

-- eski (ip) unique/index varsa (ip, action) ikilisine genişlet
drop index if exists idx_rate_limits_ip;
create index if not exists idx_rate_limits_ip_action on public.rate_limits(ip, action);
