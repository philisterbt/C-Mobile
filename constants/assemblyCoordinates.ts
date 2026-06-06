// Doğrulanmış toplanma alanı koordinatları (OpenStreetMap / Google Maps WGS84)
// Backend koordinatları bazen park/stadyum merkezinden birkaç km sapabiliyor.

export interface LatLngPair {
  lat: number;
  lng: number;
}

/** İstanbul toplanma alanları için bilinen doğru konumlar */
const VERIFIED_ASSEMBLY_COORDS: Record<string, LatLngPair> = {
  "ataturk olimpiyat stadi": { lat: 41.07485, lng: 28.7657 },
  "ataturk olimpiyat stad": { lat: 41.07485, lng: 28.7657 },
  "yildiz parki": { lat: 41.04993, lng: 29.01756 },
  "macka parki": { lat: 41.04782, lng: 28.99357 },
  "gulhane parki": { lat: 41.01286, lng: 28.98176 },
  "fatih millet bahcesi": { lat: 41.01924, lng: 28.93695 },
};

/** Türkçe karakterleri ASCII'ye indirip karşılaştırma anahtarı üretir. */
export function normalizePlaceName(name: string): string {
  return name
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Alan adına göre doğrulanmış koordinat varsa döndürür. */
export function getVerifiedAssemblyCoords(name: string): LatLngPair | null {
  const key = normalizePlaceName(name);

  if (VERIFIED_ASSEMBLY_COORDS[key]) {
    return VERIFIED_ASSEMBLY_COORDS[key];
  }

  // Kısmi eşleşme (backend adı biraz farklı yazılmış olabilir)
  for (const [pattern, coords] of Object.entries(VERIFIED_ASSEMBLY_COORDS)) {
    if (key.includes(pattern) || pattern.includes(key)) {
      return coords;
    }
  }

  return null;
}

/** İstanbul merkez — varsayılan harita odağı */
export const ISTANBUL_CENTER = {
  lat: 41.0369,
  lng: 28.985,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};
