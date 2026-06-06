// Koordinat normalleştirme - backend'den gelen lat/lng hatalarını düzeltir
import { getVerifiedAssemblyCoords } from "../constants/assemblyCoordinates";
import type { AssemblyPoint } from "../types/api";

/** Türkiye (İstanbul civarı) için geçerli enlem aralığı */
function isLikelyLatitude(value: number): boolean {
  return value >= 36 && value <= 43;
}

/** Türkiye için geçerli boylam aralığı */
function isLikelyLongitude(value: number): boolean {
  return value >= 25 && value <= 46;
}

/**
 * lat/lng değerlerini doğrular; ters gelmişse otomatik düzeltir.
 * Backend bazen alanları karıştırabilir veya GeoJSON [lng, lat] sırası kullanabilir.
 */
export function normalizeLatLng(
  lat: number,
  lng: number
): { lat: number; lng: number } {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { lat: 0, lng: 0 };
  }

  const latOk = isLikelyLatitude(lat);
  const lngOk = isLikelyLongitude(lng);

  if (latOk && lngOk) return { lat, lng };

  // Değerler muhtemelen ters: enlem/boylam yer değiştirmiş
  if (isLikelyLatitude(lng) && isLikelyLongitude(lat)) {
    return { lat: lng, lng: lat };
  }

  return { lat, lng };
}

/** Ham API kaydını güvenli AssemblyPoint'e çevirir. */
export function normalizeAssemblyPoint(raw: Record<string, unknown>): AssemblyPoint {
  const name = String(raw.name ?? "Toplanma Alanı");
  const verified = getVerifiedAssemblyCoords(name);

  if (verified) {
    return {
      name,
      lat: verified.lat,
      lng: verified.lng,
      capacity: Number(raw.capacity ?? 0),
    };
  }

  const latRaw = raw.lat ?? raw.latitude;
  const lngRaw = raw.lng ?? raw.longitude ?? raw.lon;
  const { lat, lng } = normalizeLatLng(Number(latRaw), Number(lngRaw));

  return {
    name,
    lat,
    lng,
    capacity: Number(raw.capacity ?? 0),
  };
}

/** Toplanma alanı listesini normalleştirir. */
export function normalizeAssemblyPoints(
  points: AssemblyPoint[] | Record<string, unknown>[]
): AssemblyPoint[] {
  return points.map((p) =>
    normalizeAssemblyPoint(p as Record<string, unknown>)
  );
}

/** react-native-maps Marker koordinatı (latitude/longitude sırası). */
export function toMapCoordinate(point: { lat: number; lng: number }) {
  const { lat, lng } = normalizeLatLng(point.lat, point.lng);
  return { latitude: lat, longitude: lng };
}

/** Haritaya sığdırmak için koordinat listesi üretir. */
export function toMapCoordinates(points: Array<{ lat: number; lng: number }>) {
  return points.map((p) => toMapCoordinate(p));
}

/** Kullanıcı konumu toplanma alanları bölgesine yakın mı? (metre) */
export function isNearAssemblyRegion(
  user: { lat: number; lng: number },
  points: Array<{ lat: number; lng: number }>,
  maxDistanceMeters = 120_000
): boolean {
  if (points.length === 0) return true;

  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  let min = Infinity;
  for (const point of points) {
    const dLat = toRad(point.lat - user.lat);
    const dLng = toRad(point.lng - user.lng);
    const lat1 = toRad(user.lat);
    const lat2 = toRad(point.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    if (dist < min) min = dist;
  }

  return min <= maxDistanceMeters;
}
