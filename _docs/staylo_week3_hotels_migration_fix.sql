-- ============================================================
-- STAYLO — Hafta 3: rate_limits primary key düzeltmesi
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- ⚠️ Neden gerekli: staylo_week3_hotels_migration.sql ile `action`
-- kolonu eklendi, ama tablonun PRIMARY KEY'i hâlâ sadece `ip` üzerinde
-- (rate_limits_pkey). Bu yüzden aynı IP için hem 'search' hem 'hotels'
-- action'ı için ayrı satır oluşturulamıyor — ikinci insert primary key
-- çakışmasıyla (23505 duplicate key) sessizce başarısız oluyor ve kod
-- fail-open davranarak isteğe izin veriyor (rate limit gerçekte çalışmıyor).
-- ============================================================

alter table public.rate_limits drop constraint if exists rate_limits_pkey;
alter table public.rate_limits add primary key (ip, action);

-- migration'da eklenen düz index artık PK ile aynı kolonları kapsıyor, gereksiz
drop index if exists idx_rate_limits_ip_action;
