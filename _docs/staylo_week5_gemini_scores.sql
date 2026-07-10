-- ============================================================
-- STAYLO — Hafta 5 adım 2: hotel_analysis.gemini_scores kolonu
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- Gemini'nin ham yorumlardan (google_data + tripadvisor_data) ürettiği
-- kriter bazlı skorlar (0-10). Aynı satırda, aynı 24s TTL (created_at) ile
-- cache'lenir — her istekte Gemini'ye gitmesin (kota + maliyet koruması).
--
-- ⚠️ Skorlar weight'ten BAĞIMSIZ (per-otel, cacheable). Ağırlıklı toplam skor
-- kullanıcı weight'leriyle her istekte server'da hesaplanır, cache'lenmez.
-- ============================================================

alter table public.hotel_analysis add column if not exists gemini_scores jsonb;
