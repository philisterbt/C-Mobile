// Risk analizi hook'u - loading ve hata durumlarını yönetir
// Risk endpoint'i yavaş olduğu için (Wiro AI + cold start) loading uzun sürebilir.
import { useState, useCallback } from "react";
import { api } from "../services/api";
import type { RiskResponse } from "../types/api";

interface UseRiskAnalysisResult {
  data: RiskResponse | null;
  loading: boolean;
  error: string | null;
  analyze: (lat: number, lng: number) => Promise<void>;
}

export function useRiskAnalysis(): UseRiskAnalysisResult {
  const [data, setData] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verilen koordinat için risk skorunu backend'den ister
  const analyze = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getRisk({ lat, lng });
      setData(result);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "";
      setError(cleanRiskError(raw));
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, analyze };
}

// Backend bazen AI'ın ham (bozuk JSON) çıktısını uzun bir hata mesajı olarak döner.
// Kullanıcıya devasa ham metin göstermemek için kısa ve anlaşılır mesaja çeviririz.
function cleanRiskError(raw: string): string {
  if (!raw) return "Bilinmeyen bir hata oluştu.";
  // AI çözümleme/parse hataları ya da aşırı uzun teknik mesajlar
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
