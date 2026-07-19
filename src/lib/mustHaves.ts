// ============================================================================
// Must-have → liteAPI (Nuitee) facility eşlemesi.
//
// GET /data/facilities (814 kayıt) referansından ELLE KÜRATE edilmiş ID setleri
// (2026-07, gerçek API verisiyle). Naive keyword eşleme yanlış-pozitif üretiyordu
// ("Billiards or pool table", "Safe-deposit box at front desk" vb.) — o yüzden
// her must-have için sadece gerçekten o olanağı temsil eden facility_id'ler.
//
// Bir otel bir must-have'i "karşılar" = otelin facilityIds dizisi, o must-have'in
// set'inden EN AZ BİR id içeriyorsa.
//
// `breakfast_included` bir facility DEĞİL → rate boardType/boardName üzerinden
// ayrı ele alınır (bkz. api/hotels: rateHasBreakfast). Burada yok.
// `walk_to_centre`, `balcony`, `kitchenette` bilinçli olarak yok:
//   - walk_to_centre: konum/mesafe (walkability ağırlığında zaten var), amenity değil
//   - balcony: oda-seviyesi, güvenilir otel-facility karşılığı yok
//   - kitchenette: referansta sadece "Shared kitchen" var (farklı kavram)
// ============================================================================

export const FACILITY_MAP: Record<string, number[]> = {
  pool: [301, 104, 103, 192, 120, 122], // Swimming/Outdoor/Indoor/Rooftop/seasonal
  free_wifi: [107, 775], // Free WiFi (+ limited); "available"(47)/paid(164) hariç
  air_conditioning: [109],
  pet_friendly: [4], // Pets allowed (pet-sitting/grooming servisleri hariç)
  family_rooms: [28],
  free_parking: [46, 674, 676, 715], // Free Parking / self / valet / long-term
  airport_shuttle: [17, 139, 140, 493, 689, 690, 691, 692], // shuttle + airport transportation
  gym_fitness: [11, 492, 723, 757, 1725, 6848], // Fitness center/facilities (onsite)
  reception_24h: [8], // 24-hour front desk
  non_smoking: [16, 108], // Non-smoking rooms / throughout
  spa: [54, 557, 1102], // Spa/wellness center + Full-service spa
}

// Facility'ye map'lenen must-have'ler (breakfast_included gibi facility olmayanları eler).
export function facilityMustHaves(mustHaves: string[]): string[] {
  return mustHaves.filter((m) => Object.prototype.hasOwnProperty.call(FACILITY_MAP, m))
}

// Otelin facilityIds'i tek bir facility-must-have'i karşılıyor mu?
export function hotelHasMustHave(facilityIds: number[], mustHave: string): boolean {
  const ids = FACILITY_MAP[mustHave]
  if (!ids || !Array.isArray(facilityIds)) return false
  return ids.some((id) => facilityIds.includes(id))
}

// Otel, istenen facility-must-have'lerden kaçını karşılıyor?
export function countFacilityMatches(facilityIds: number[], mustHaves: string[]): number {
  return facilityMustHaves(mustHaves).reduce(
    (n, m) => (hotelHasMustHave(facilityIds, m) ? n + 1 : n),
    0
  )
}
