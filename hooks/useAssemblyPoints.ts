// Toplanma alanlarını backend'den çeker; offline ise yerel DB'den okur
import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { getLocalAssemblyPoints } from "../services/localDB";
import { isOnline } from "../utils/network";
import { normalizeAssemblyPoints } from "../utils/coordinates";
import type { AssemblyPoint } from "../types/api";

interface UseAssemblyPointsResult {
  points: AssemblyPoint[];
  loading: boolean;
  error: string | null;
  isOfflineData: boolean;
  reload: () => void;
}

export function useAssemblyPoints(): UseAssemblyPointsResult {
  const [points, setPoints] = useState<AssemblyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineData, setIsOfflineData] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsOfflineData(false);

    try {
      const online = await isOnline();

      if (online) {
        const data = await api.getAssemblyPoints();
        setPoints(normalizeAssemblyPoints(data));
        return;
      }

      const local = await getLocalAssemblyPoints();
      if (local.length > 0) {
        setPoints(normalizeAssemblyPoints(local));
        setIsOfflineData(true);
      } else {
        setError("İnternet yok ve offline harita indirilmemiş.");
      }
    } catch {
      const local = await getLocalAssemblyPoints();
      if (local.length > 0) {
        setPoints(normalizeAssemblyPoints(local));
        setIsOfflineData(true);
      } else {
        setError("Toplanma alanları yüklenemedi.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { points, loading, error, isOfflineData, reload: load };
}
