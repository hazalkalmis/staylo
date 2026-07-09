const EARTH_RADIUS_M = 6_371_000

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_M * c
}

// 900 -> "~900m", 1850 -> "~1.9km"
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `~${Math.round(meters / 50) * 50}m`
  }
  return `~${(meters / 1000).toFixed(1)}km`
}
