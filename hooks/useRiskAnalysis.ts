// Risk analizi hook'u - konuma göre önbellekli, sekmeler arası kalıcı
import { useState, useCallback, useRef } from "react";
import { api } from "../services/api";
import { distanceMeters } from "../utils/geo";
import type { RiskResponse } from "../types/api";

/** Aynı konum sayılması için tolerans (metre) */
const LOCATION_TOLERANCE_M = 200;

interface CachedRisk {
  lat: number;
  lng: number;
  data: RiskResponse;
}

interface CachedRiskError {
  lat: number;
  lng: number;
  message: string;
}

// Sekme değişince bile korunur (MainTabs seviyesinde tutulur)
let cachedRisk: CachedRisk | null = null;
let cachedError: CachedRiskError | null = null;

function isSameLocation(
  lat: number,
  lng: number,
  cached: { lat: number; lng: number }
): boolean {
  return distanceMeters({ lat, lng }, cached) <= LOCATION_TOLERANCE_M;
}

/** RiskScreen ilk render'da önbelleği gösterebilsin diye dışa açık okuyucu */
export function getCachedRiskForLocation(
  lat: number,
  lng: number
): RiskResponse | null {
  if (cachedRisk && isSameLocation(lat, lng, cachedRisk)) {
    return cachedRisk.data;
  }
  return null;
}

export function getCachedRiskErrorForLocation(
  lat: number,
  lng: number
): string | null {
  if (cachedError && isSameLocation(lat, lng, cachedError)) {
    return cachedError.message;
  }
  return null;
}

interface UseRiskAnalysisResult {
  data: RiskResponse | null;
  loading: boolean;
  error: string | null;
  /** Önbellekte yoksa analiz yapar; aynı konumda tekrar istek atmaz */
  analyzeIfNeeded: (lat: number, lng: number) => Promise<void>;
  /** Her zaman yeni analiz ister */
  refresh: (lat: number, lng: number) => Promise<void>;
}

export function useRiskAnalysis(): UseRiskAnalysisResult {
  const [data, setData] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const runAnalysis = useCallback(async (lat: number, lng: number, force: boolean) => {
    if (!force && cachedRisk && isSameLocation(lat, lng, cachedRisk)) {
      setData(cachedRisk.data);
      setError(null);
      setLoading(false);
      return;
    }

    if (!force && cachedError && isSameLocation(lat, lng, cachedError)) {
      setData(null);
      setError(cachedError.message);
      setLoading(false);
      return;
    }

    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await api.getRisk({ lat, lng });
      cachedRisk = { lat, lng, data: result };
      cachedError = null;
      setData(result);
    } catch (e) {
      const message = cleanRiskError(e instanceof Error ? e.message : "");
      cachedError = { lat, lng, message };
      cachedRisk = null;
      setData(null);
      setError(message);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  const analyzeIfNeeded = useCallback(
    (lat: number, lng: number) => runAnalysis(lat, lng, false),
    [runAnalysis]
  );

  const refresh = useCallback(
    (lat: number, lng: number) => runAnalysis(lat, lng, true),
    [runAnalysis]
  );

  return { data, loading, error, analyzeIfNeeded, refresh };
}

function cleanRiskError(raw: string): string {
  if (!raw) return "Bilinmeyen bir hata oluştu.";
  if (
    raw.includes("çözümlenemedi") ||
    raw.includes("ham:") ||
    raw.includes("invalid character") ||
    raw.length > 140
  ) {
    return "Risk analizi şu anda tamamlanamadı. Sunucu yoğun olabilir, lütfen birazdan tekrar deneyin.";
  }
  return raw;
}
