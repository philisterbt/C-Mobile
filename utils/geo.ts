// Coğrafi hesaplama ve biçimlendirme yardımcıları

export interface LatLng {
  lat: number;
  lng: number;
}

// İki koordinat arası yaklaşık mesafe (metre) - Haversine formülü
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000; // Dünya yarıçapı (metre)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

// Mesafeyi okunabilir metne çevirir (örn. 850 m, 1.4 km)
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Saniyeyi okunabilir süreye çevirir (örn. 3 dk, 1 sa 5 dk)
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} dk`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} sa ${minutes} dk` : `${hours} sa`;
}
