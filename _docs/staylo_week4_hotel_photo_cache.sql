-- ============================================================
-- STAYLO — Hafta 4: hotel_photo_cache tablosu
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- Google Places'ten çekilen otel fotoğraflarının (URL string, görselin
-- kendisi değil — staylo_supabase_rules.md kuralı) 24 saat TTL cache'i.
-- `hotel_id` = Nuitee hotel id (stabil, name+address string eşleştirmesinden
-- daha güvenilir bir cache anahtarı).
-- ============================================================

create table if not exists public.hotel_photo_cache (
  hotel_id     text primary key,
  photo_url    text,
  created_at   timestamptz not null default now()
);

alter table public.hotel_photo_cache enable row level security;
-- Policy yok = tamamen kapalı, sadece service_role erişir
grant select, insert, update, delete on public.hotel_photo_cache to service_role;
