-- ============================================================
-- STAYLO — Hafta 7: favorites (kullanıcı favorileri)
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- ⚠️ Diğer tablolardan FARKLI RLS deseni: bu bir KULLANICI tablosu.
--   Erişim service_role ile DEĞİL, giriş yapmış kullanıcının kendi JWT'siyle
--   (anon key + session) + RLS üzerinden. Grant 'authenticated' rolüne verilir,
--   her policy auth.uid() = user_id'ye kilitlenir → kullanıcı SADECE kendi
--   favorisini görebilir/ekleyebilir/silebilir. service_role bu tabloya girmez.
--
-- ⚠️ NOT: Testte, eksik kolonlu (country/photo_url/price_*/fit_score YOK) eski
--   bir favorites tablosu tespit edildi → 'create table if not exists' no-op
--   oluyordu. Aşağıdaki DROP onu temizler. Tabloda değerli veri YOK (auth henüz
--   yeni bağlanıyor), temiz kurulum güvenli. Veri tutmak istersen DROP'u silip
--   eksik kolonları 'alter table ... add column if not exists' ile ekle.
-- ============================================================

drop table if exists public.favorites cascade;

create table if not exists public.favorites (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  hotel_id       text not null,                 -- Nuitee lp id
  hotel_name     text,
  city           text,
  country        text,
  photo_url      text,
  price_amount   numeric,
  price_currency text,
  fit_score      numeric,                       -- Staylo fit (0-10), snapshot
  created_at     timestamptz not null default now(),
  unique (user_id, hotel_id)                    -- toggle idempotent + user_id lider indeks
);

alter table public.favorites enable row level security;

-- Kullanıcı SADECE kendi satırlarını görebilir
create policy "favorites_select_own" on public.favorites
  for select to authenticated
  using (auth.uid() = user_id);

-- Kullanıcı SADECE kendi adına ekleyebilir
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Kullanıcı SADECE kendi satırını silebilir
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated
  using (auth.uid() = user_id);

-- authenticated rolüne veri hakkı (RLS zaten satır bazında kısıtlıyor).
-- NOT: update policy'si YOK — favori güncellenmez, ya eklenir ya silinir.
grant select, insert, delete on public.favorites to authenticated;

-- PostgREST şema cache'ini tazele — yeni kolonlar anında görünür olsun
-- (aksi halde ilk insert'lerde "column ... in the schema cache" hatası alınır).
notify pgrst, 'reload schema';
