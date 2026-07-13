import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendAlertEmail } from '@/lib/email'

// ----------------------------------------------------------------------------
// Kod tarafı günlük kullanım sayacı — dış API maliyet koruması (panel dışı,
// hassas, kaynak bazlı). api_usage(api, day, count) + atomik incr RPC.
// Eşik dolunca çağıran kaynak o gün atlanır (fail-safe); ertesi gün sıfırlanır.
// ----------------------------------------------------------------------------

// Global Gemini günlük çağrı tavanı — çıkarım (/api/search) + skorlama
// (hotelAnalysis) ORTAK sayılır. Prepay bakiyesini anormal patlamaya karşı koruyan
// bir SİGORTA (gerçek launch trafiğini etkilemeyecek kadar cömert). Env ile
// override edilebilir; Vercel'de değişiklik redeploy ister. Varsayılan 2000
// ≈ $4-8/gün. Tavan dolunca: çıkarım 503 "busy", skorlama sessizce cache/havuza
// düşer (graceful) ve recordUsage eşiği geçince BUDGET_ALERT_EMAIL'e mail gider.
export const GEMINI_DAILY_CAP = Number(process.env.GEMINI_DAILY_CAP) || 2000

function today(): string {
  return new Date().toISOString().slice(0, 10) // UTC gün (YYYY-MM-DD)
}

// Bugünün kullanım sayısı. DB hatasında fail-open (0 döner) — geçici bir okuma
// hatası skorlamayı bloke etmesin; sayaç bir güvenlik ağı, kesin garanti değil.
export async function getDailyUsage(api: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('api_usage')
    .select('count')
    .eq('api', api)
    .eq('day', today())
    .maybeSingle()
  if (error) {
    console.error('api_usage read error:', error.message)
    return 0
  }
  return data?.count ?? 0
}

// Kullanımı atomik artır. Eşik BU çağrıda aşıldıysa bir kez alert log'la + e-posta gönder.
export async function recordUsage(api: string, units: number, threshold: number): Promise<void> {
  if (units <= 0) return
  const { data, error } = await supabaseAdmin.rpc('incr_api_usage', {
    p_api: api,
    p_day: today(),
    p_by: units,
  })
  if (error) {
    console.error('api_usage incr error:', error.message)
    return
  }
  const newCount = typeof data === 'number' ? data : Number(data)
  if (Number.isFinite(newCount) && newCount >= threshold && newCount - units < threshold) {
    const message =
      `[BUDGET ALERT] ${api} günlük eşiğe ulaşıldı: ${newCount}/${threshold} (${today()}). ` +
      `Bugün ${api} çağrıları duracak, otel diğer kaynaktan + birikmiş havuzdan skorlanacak.`
    console.error(message)
    // Best-effort: BUDGET_ALERT_EMAIL boşsa sendAlertEmail sessizce loglayıp atlar (fail-safe).
    void sendAlertEmail(process.env.BUDGET_ALERT_EMAIL || '', `[Staylo] ${api} günlük API eşiği doldu`, message)
  }
}
