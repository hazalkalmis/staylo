-- ============================================================
-- STAYLO — Hafta 6: click_logs (Booking yönlendirme + komisyon takibi)
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- Kullanıcı sonuç kartındaki "View on Booking" butonuna tıklayınca önce
-- /api/redirect'e gelir; burası tıklamayı bu tabloya yazar, sonra gerçek
-- Booking.com deep-link'ine 302 yönlendirir. Amaç: komisyon/attribution
-- takibi + hangi otel/şehir ilgi görüyor analizi.
--
-- affiliate_network: hangi ağ üstünden gittiği (env AFFILIATE_NETWORK'ten).
--   CJ ya da Expedia onayı HENÜZ Pending → şimdilik null olabilir. Ağ
--   netleşince sadece env doldurulur, kod/tablo değişmez.
--
-- ⚠️ RLS: service_role only, diğer tablolarla (api_usage, rate_limits) aynı desen.
--   Tıklama logu hassas (IP içerir) — anon/authenticated erişemez.
--
-- ⚠️ NOT: Bu projede daha önce YARIM kalmış bir click_logs tablosu tespit edildi
--   (eksik sütunlar + service_role grant'ı yok → "permission denied"). Aşağıdaki
--   DROP onu temizler. Tabloda değerli veri YOK (log tablosu, henüz canlı değil),
--   bu yüzden temiz kurulum güvenli. İçinde tutmak istediğin veri varsa DROP'u
--   silip bunun yerine eksik sütunları ALTER ... ADD COLUMN ile ekle.
-- ============================================================

drop table if exists public.click_logs cascade;

create table if not exists public.click_logs (
  id                uuid primary key default gen_random_uuid(),
  hotel_id          text not null,
  hotel_name        text,
  city              text,
  affiliate_network text,                       -- 'cj' | 'expedia' | null (henüz onay yok)
  destination_url   text not null,              -- gerçekte yönlendirilen nihai URL
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  clicked_at        timestamptz not null default now(),
  ip                text
);

-- Analiz sorguları için yardımcı indeksler (otel/şehir bazlı + zaman serisi)
create index if not exists click_logs_hotel_id_idx on public.click_logs (hotel_id);
create index if not exists click_logs_clicked_at_idx on public.click_logs (clicked_at desc);

alter table public.click_logs enable row level security;
grant select, insert, update, delete on public.click_logs to service_role;

-- PostgREST şema cache'ini tazele — yeni tablo/sütunlar anında görünür olsun
-- (aksi halde ilk insert'lerde "column ... in the schema cache" hatası alınır).
notify pgrst, 'reload schema';
