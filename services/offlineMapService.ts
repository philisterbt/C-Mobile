// Offline harita indirme servisi - bölge paketi, tile'lar ve acil ipuçları
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  documentDirectory,
  downloadAsync,
  makeDirectoryAsync,
  deleteAsync,
  getInfoAsync,
} from "expo-file-system/legacy";
import { api } from "./api";
import { normalizeAssemblyPoints } from "../utils/coordinates";
import {
  saveAssemblyPoints,
  saveDownloadedRegion,
  getDownloadedRegions,
  deleteDownloadedRegion,
} from "./localDB";
import type { OfflineBundle, OfflineRegion } from "../types/offline";

const EMERGENCY_TIPS_KEY = "@afet_yolu/emergency_tips";
const BUNDLE_PREFIX = "@afet_yolu/offline_bundle_";

/** Tile dosyalarının saklandığı dizin. */
export const OFFLINE_MAP_DIR = `${documentDirectory ?? ""}offline_maps/`;

/** Enlem/boylamı tile X indeksine çevirir. */
function lngToTileX(lng: number, zoom: number): number {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
}

/** Enlem/boylamı tile Y indeksine çevirir. */
function latToTileY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

/** Bölge sınırları içindeki tüm tile koordinatlarını üretir. */
function getTilesForBBox(
  region: OfflineBundle["region"],
  zoom: number
): Array<{ z: number; x: number; y: number }> {
  const minX = lngToTileX(region.min_lng, zoom);
  const maxX = lngToTileX(region.max_lng, zoom);
  const minY = latToTileY(region.max_lat, zoom); // kuzey = düşük Y
  const maxY = latToTileY(region.min_lat, zoom);

  const tiles: Array<{ z: number; x: number; y: number }> = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ z: zoom, x, y });
    }
  }
  return tiles;
}

/** Backend'den indirilebilir bölgeleri getirir. */
export async function fetchOfflineRegions(): Promise<OfflineRegion[]> {
  return api.getOfflineRegions();
}

/** Bölge paketini indirir: metadata, toplanma alanları, tile'lar ve acil ipuçları. */
export async function downloadOfflineRegion(
  regionId: string,
  regionName: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const bundle = await api.getOfflineBundle(regionId);

  // Metadata ve acil ipuçlarını kaydet
  await AsyncStorage.setItem(`${BUNDLE_PREFIX}${regionId}`, JSON.stringify(bundle));
  await AsyncStorage.setItem(EMERGENCY_TIPS_KEY, JSON.stringify(bundle.emergency_tips));

  // Toplanma alanlarını SQLite'a yaz
  await saveAssemblyPoints(regionId, normalizeAssemblyPoints(bundle.assembly_points));

  // Tile dizinini oluştur
  const regionDir = `${OFFLINE_MAP_DIR}${regionId}/`;
  await makeDirectoryAsync(regionDir, { intermediates: true });

  // Tüm zoom seviyelerindeki tile'ları indir
  let downloaded = 0;
  const allTiles: Array<{ z: number; x: number; y: number }> = [];

  for (let z = bundle.region.min_zoom; z <= bundle.region.max_zoom; z++) {
    allTiles.push(...getTilesForBBox(bundle.region, z));
  }

  const total = allTiles.length;

  for (const tile of allTiles) {
    const url = bundle.tile_config.url_template
      .replace("{z}", String(tile.z))
      .replace("{x}", String(tile.x))
      .replace("{y}", String(tile.y));

    const dir = `${regionDir}${tile.z}/${tile.x}/`;
    await makeDirectoryAsync(dir, { intermediates: true });

    const localPath = `${dir}${tile.y}.png`;
    try {
      await downloadAsync(url, localPath);
    } catch {
      // Tek tile hatası tüm indirmeyi durdurmasın
    }

    downloaded++;
    onProgress?.(downloaded, total);
  }

  await saveDownloadedRegion({
    region_id: regionId,
    name: regionName,
    downloaded_at: new Date().toISOString(),
    tile_count: downloaded,
  });
}

/** İndirilen bölgeleri listeler. */
export async function listDownloadedRegions() {
  return getDownloadedRegions();
}

/** Bölgeyi ve tile dosyalarını siler. */
export async function removeOfflineRegion(regionId: string): Promise<void> {
  const regionDir = `${OFFLINE_MAP_DIR}${regionId}/`;
  const info = await getInfoAsync(regionDir);
  if (info.exists) {
    await deleteAsync(regionDir, { idempotent: true });
  }
  await AsyncStorage.removeItem(`${BUNDLE_PREFIX}${regionId}`);
  await deleteDownloadedRegion(regionId);
}

/** Kayıtlı acil ipuçlarını getirir. */
export async function getEmergencyTips(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(EMERGENCY_TIPS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/** Aktif offline harita bölgesinin tile URL şablonunu döndürür. */
export async function getActiveOfflineTileTemplate(): Promise<string | null> {
  const regions = await getDownloadedRegions();
  if (regions.length === 0) return null;
  const regionId = regions[0].region_id;
  return `file://${OFFLINE_MAP_DIR}${regionId}/{z}/{x}/{y}.png`;
}

/** İndirilmiş offline harita var mı? */
export async function hasOfflineMap(): Promise<boolean> {
  const regions = await getDownloadedRegions();
  return regions.length > 0;
}
