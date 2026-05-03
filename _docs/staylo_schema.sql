-- ============================================================
-- STAYLO — Supabase Schema
-- Supabase SQL Editor'a yapıştır, sırayla çalıştır
-- ⚠️ Her tablo için RLS aktif — varsayılan "herkese kapalı"
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";


-- ============================================================
-- 1. USERS (Supabase Auth ile otomatik — sadece profil eki)
-- ============================================================
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  created_at  timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Kullanıcı kendi profilini okuyabilir"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.profiles for update
  using (auth.uid() = id);

-- Auth trigger: yeni kullanıcı kayıtta profil oluştur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. SEARCHES — Son 30 arama geçmişi
-- ============================================================
create table public.searches (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  query       text not null,                    -- Kullanıcının yazdığı ham metin
  filters     jsonb,                            -- Claude'un çıkardığı filtreler
  weights     jsonb,                            -- Kullanıcının belirlediği ağırlıklar
  city        text,
  created_at  timestamptz default now()
);

-- RLS
alter table public.searches enable row level security;

create policy "Kullanıcı kendi aramalarını okuyabilir"
  on public.searches for select
  using (auth.uid() = user_id);

create policy "Kullanıcı arama ekleyebilir"
  on public.searches for insert
  with check (auth.uid() = user_id);

create policy "Kullanıcı kendi aramalarını silebilir"
  on public.searches for delete
  using (auth.uid() = user_id);

-- Index
create index idx_searches_user_created on public.searches(user_id, created_at desc);

-- Otomatik silme: 31. kayıtta en eskisi silinir
create or replace function public.limit_user_searches()
returns trigger as $$
begin
  delete from public.searches
  where id in (
    select id from public.searches
    where user_id = new.user_id
    order by created_at desc
    offset 30
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger after_search_insert
  after insert on public.searches
  for each row execute procedure public.limit_user_searches();


-- ============================================================
-- 3. FAVORITES — Favori oteller
-- ============================================================
create table public.favorites (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  hotel_id    text not null,                    -- Booking hotel ID
  hotel_name  text,
  hotel_data  jsonb,                            -- Snapshot (fiyat, puan vs)
  city        text,
  created_at  timestamptz default now(),
  unique(user_id, hotel_id)
);

-- RLS
alter table public.favorites enable row level security;

create policy "Kullanıcı kendi favorilerini okuyabilir"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Kullanıcı favori ekleyebilir"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Kullanıcı kendi favorisini silebilir"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Index
create index idx_favorites_user on public.favorites(user_id);


-- ============================================================
-- 4. HOTEL_ANALYSIS — Yorum analizi cache (24 saat TTL)
-- ============================================================
create table public.hotel_analysis (
  hotel_id      text primary key,
  city          text,
  analysis_json jsonb not null,                 -- Claude Sonnet çıktısı
  created_at    timestamptz default now()
);

-- RLS: Herkes okuyabilir (cache), sadece server yazabilir
alter table public.hotel_analysis enable row level security;

create policy "Herkes yorum analizini okuyabilir"
  on public.hotel_analysis for select
  using (true);

-- INSERT/UPDATE sadece service_role key ile (server-side API route)
-- Client hiç yazamaz — RLS policy yok = kapalı

-- Index: TTL sorgusu için
create index idx_hotel_analysis_created on public.hotel_analysis(created_at);

-- Temizlik: 24 saatten eski kayıtları sil (cron job veya trigger)
create or replace function public.clean_old_analysis()
returns void as $$
begin
  delete from public.hotel_analysis
  where created_at < now() - interval '24 hours';
end;
$$ language plpgsql security definer;


-- ============================================================
-- 5. TOURIST_CACHE — Google Places cache (24 saat TTL)
-- ============================================================
create table public.tourist_cache (
  city          text primary key,
  places_json   jsonb not null,                 -- Google Places Nearby Search çıktısı
  created_at    timestamptz default now()
);

-- RLS
alter table public.tourist_cache enable row level security;

create policy "Herkes turistik yerleri okuyabilir"
  on public.tourist_cache for select
  using (true);

-- Sadece service_role yazabilir


-- ============================================================
-- 6. CLICK_LOGS — UTM tıklama takibi
-- ============================================================
create table public.click_logs (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete set null,
  hotel_id      text not null,
  hotel_name    text,
  city          text,
  booking_url   text,                           -- UTM'li tam URL
  utm_source    text default 'staylo',
  utm_medium    text default 'affiliate',
  utm_campaign  text,
  ip_hash       text,                           -- Hash'lenmiş IP (GDPR)
  created_at    timestamptz default now()
);

-- RLS: Kullanıcı kendi tıklamalarını görebilir, yazmak herkese açık
alter table public.click_logs enable row level security;

create policy "Kullanıcı kendi tıklamalarını okuyabilir"
  on public.click_logs for select
  using (auth.uid() = user_id);

create policy "Herkes tıklama logu ekleyebilir"
  on public.click_logs for insert
  with check (true);

-- IP temizleme: 24 saat sonra ip_hash sil
create or replace function public.clean_ip_hashes()
returns void as $$
begin
  update public.click_logs
  set ip_hash = null
  where created_at < now() - interval '24 hours'
    and ip_hash is not null;
end;
$$ language plpgsql security definer;

-- Index
create index idx_click_logs_created on public.click_logs(created_at);
create index idx_click_logs_hotel on public.click_logs(hotel_id);


-- ============================================================
-- 7. WEIGHT_PROFILES — Kayıtlı ağırlık profilleri
-- ============================================================
create table public.weight_profiles (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,                    -- "Family Trip", "Business" vs
  weights     jsonb not null,                   -- {safety: 30, quiet: 25, ...}
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- RLS
alter table public.weight_profiles enable row level security;

create policy "Kullanıcı kendi profillerini okuyabilir"
  on public.weight_profiles for select
  using (auth.uid() = user_id);

create policy "Kullanıcı profil ekleyebilir"
  on public.weight_profiles for insert
  with check (auth.uid() = user_id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.weight_profiles for update
  using (auth.uid() = user_id);

create policy "Kullanıcı kendi profilini silebilir"
  on public.weight_profiles for delete
  using (auth.uid() = user_id);


-- ============================================================
-- 8. RATE_LIMITS — IP bazlı rate limiting
-- ============================================================
create table public.rate_limits (
  id          uuid default uuid_generate_v4() primary key,
  ip_hash     text not null,
  action      text not null,                    -- 'search', 'analyze'
  count       int default 1,
  window_end  timestamptz not null,             -- 1 dakika veya 1 gün
  created_at  timestamptz default now()
);

-- RLS: Sadece service_role erişir
alter table public.rate_limits enable row level security;
-- Policy yok = tamamen kapalı, sadece server-side erişir

-- Index
create index idx_rate_limits_ip_window on public.rate_limits(ip_hash, action, window_end);

-- Temizlik
create or replace function public.clean_expired_rate_limits()
returns void as $$
begin
  delete from public.rate_limits
  where window_end < now();
end;
$$ language plpgsql security definer;


-- ============================================================
-- 9. Vercel Cron için: keep_alive ping tablosu
-- ============================================================
create table public.keep_alive (
  id        int primary key default 1,
  pinged_at timestamptz default now()
);

insert into public.keep_alive (id) values (1);

alter table public.keep_alive enable row level security;
-- Kapalı — sadece service_role erişir


-- ============================================================
-- ✅ KURULUM TAMAMLANDI
-- Kontrol:
-- Supabase → Authentication → Policies
-- Her tabloda RLS "Enabled" görünmeli
-- ============================================================
