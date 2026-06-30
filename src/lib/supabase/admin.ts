import 'server-only' // ⚠️ Bu dosya ASLA client'a gitmez. Client'a import edilirse build hata verir.
import { createClient } from '@supabase/supabase-js'

/**
 * Supabase ADMIN istemcisi — service_role key ile.
 * RLS'i bypass eder, tam yetkilidir. SADECE server kodunda (route.ts, server action) kullan.
 *
 * Bu klasördeki diğer dosyalardan farkı:
 *  - client.ts → tarayıcı (anon key, kullanıcı oturumu)
 *  - server.ts → SSR/oturum (anon key + cookie)
 *  - admin.ts  → server-only, service_role (rate limit, log gibi sistem işleri)
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Supabase admin env eksik: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})