// Offline harita indirme hook'u
import { useState, useEffect, useCallback } from "react";
import {
  fetchOfflineRegions,
  downloadOfflineRegion,
  listDownloadedRegions,
  removeOfflineRegion,
} from "../services/offlineMapService";
import type { OfflineRegion, DownloadedRegion } from "../types/offline";

interface UseOfflineMapResult {
  regions: OfflineRegion[];
  downloaded: DownloadedRegion[];
  loading: boolean;
  downloading: boolean;
  progress: { done: number; total: number };
  error: string | null;
  refresh: () => Promise<void>;
  download: (region: OfflineRegion) => Promise<void>;
  remove: (regionId: string) => Promise<void>;
}

export function useOfflineMap(): UseOfflineMapResult {
  const [regions, setRegions] = useState<OfflineRegion[]>([]);
  const [downloaded, setDownloaded] = useState<DownloadedRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [remote, local] = await Promise.all([
        fetchOfflineRegions().catch(() => [] as OfflineRegion[]),
        listDownloadedRegions(),
      ]);
      setRegions(remote);
      setDownloaded(local);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bölgeler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const download = useCallback(
    async (region: OfflineRegion) => {
      setDownloading(true);
      setError(null);
      setProgress({ done: 0, total: 0 });
      try {
        await downloadOfflineRegion(region.id, region.name, (done, total) => {
          setProgress({ done, total });
        });
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "İndirme başarısız.");
      } finally {
        setDownloading(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (regionId: string) => {
      await removeOfflineRegion(regionId);
      await refresh();
    },
    [refresh]
  );

  return {
    regions,
    downloaded,
    loading,
    downloading,
    progress,
    error,
    refresh,
    download,
    remove,
  };
}
