# Staylo — proje çalışma kuralları

## Migration / SQL dosyaları
Bir migration veya `.sql` dosyası oluşturduğunda (ör. `_docs/staylo_weekN_*.sql`),
mesajında **sadece dosya adını/özetini değil, SQL içeriğinin TAMAMINI da bir kod
bloğu olarak** göster. Kullanıcı bunu okuyup Supabase SQL Editor'a elle yapıştırıyor;
"içeriği göster" diye tekrar sormasına gerek kalmamalı. Her migration'da otomatik uygula.

Sebep: Bu projede DB şeması elle uygulanıyor — psql/supabase CLI/DATABASE_URL yok,
service_role sadece PostgREST veri işlemleri yapabiliyor, DDL çalıştıramıyorum.
