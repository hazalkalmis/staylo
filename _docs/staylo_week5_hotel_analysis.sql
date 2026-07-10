-- ============================================================
-- STAYLO — Hafta 5: hotel_analysis (ham yorum/puan verisi cache'i)
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- ⚠️ Bu tablo Hafta 1'de staylo_schema.sql ile zaten oluşturulmuş
-- (city + analysis_json kolonlarıyla, Claude analizi için tasarlanmıştı,
-- hiç kullanılmadı). Bu migration onu Hafta 5'in ham-veri katmanına göre
-- yeniden yapılandırıyor:
--  1) Eski "Herkes yorum analizini okuyabilir" policy'si kaldırılıyor —
--     artık service_role only (tourist_cache / hotel_photo_cache ile aynı desen).
--  2) service_role'e eksik GRANT veriliyor (REST'ten "permission denied" idi).
--  3) Kullanılmayan eski kolonlar (city, analysis_json) kaldırılıp yeni
--     ham-veri kolonları ekleniyor: google_data, tripadvisor_data.
--
-- hotel_id = Nuitee hotel id (diğer cache tablolarıyla aynı anahtar).
-- Bu aşamada SADECE ham veri saklanıyor — Gemini analizi/skorlama sonraki adım.
-- ============================================================

create table if not exists public.hotel_analysis (
  hotel_id      text primary key,
  created_at    timestamptz not null default now()
);

-- Eski "herkese açık" okuma policy'sini kaldır — service_role only
drop policy if exists "Herkes yorum analizini okuyabilir" on public.hotel_analysis;

-- Yeni ham-veri kolonları
alter table public.hotel_analysis add column if not exists google_data jsonb;
alter table public.hotel_analysis add column if not exists tripadvisor_data jsonb;

-- Kullanılmayan eski kolonları kaldır (varsa)
alter table public.hotel_analysis drop column if exists analysis_json;
alter table public.hotel_analysis drop column if exists city;

-- RLS açık kalsın, policy yok = tamamen kapalı, sadece service_role erişir
alter table public.hotel_analysis enable row level security;
grant select, insert, update, delete on public.hotel_analysis to service_role;
