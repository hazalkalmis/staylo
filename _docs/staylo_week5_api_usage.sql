-- ============================================================
-- STAYLO — Hafta 5: api_usage (kod tarafı günlük maliyet sayacı)
-- Supabase SQL Editor'a yapıştır, çalıştır.
--
-- Panel dışı, hassas, kaynak bazlı maliyet koruması. Terra Discover'da
-- dolar bazlı spending cap YOK (sadece günlük çağrı limiti, o da panelde
-- her zaman exposed değil) — bu yüzden kod tarafında kendi entity/çağrı
-- sayacımızı tutuyoruz. Eşik dolunca ilgili kaynak o gün atlanır (fail-safe),
-- otel diğer kaynaktan + birikmiş havuzdan skorlanır, kullanıcı hata görmez.
--
-- Eşikler (kodda, hotelAnalysis.ts):
--   tripadvisor → 130 entity/gün (~$2/gün; otel başına ~2 entity)
--   google      → 2000 çağrı/gün (Cloud'daki 5.000 sert quota'dan önce yumuşak fren)
--
-- ⚠️ RLS: service_role only, diğer tablolarla aynı desen.
-- ============================================================

create table if not exists public.api_usage (
  api    text not null,                        -- 'google' | 'tripadvisor'
  day    date not null,
  count  int  not null default 0,
  primary key (api, day)
);

alter table public.api_usage enable row level security;
grant select, insert, update, delete on public.api_usage to service_role;

-- Atomik artırım (serverless yarış koşulsuz) + yeni değeri döndür
create or replace function public.incr_api_usage(p_api text, p_day date, p_by int)
returns int
language plpgsql
as $$
declare
  new_count int;
begin
  insert into public.api_usage (api, day, count)
  values (p_api, p_day, p_by)
  on conflict (api, day) do update set count = public.api_usage.count + p_by
  returning count into new_count;
  return new_count;
end;
$$;
grant execute on function public.incr_api_usage(text, date, int) to service_role;
