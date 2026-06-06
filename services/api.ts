// Backend API istemcisi
// Render free tier cold start (30-60 sn) ve risk endpoint'inin Wiro AI poll'u nedeniyle
// (~15-60 sn) timeout'lar yüksek tutulur. Base URL constants/config.ts'den gelir.
import { API_URL } from "../constants/config";
import type {
  RiskRequest,
  RiskResponse,
  RouteRequest,
  RouteResponse,
  AssemblyPoint,
  HealthResponse,
} from "../types/api";
import type {
  MessageSyncRequest,
  MessageSyncResponse,
  OfflineRegion,
  OfflineBundle,
} from "../types/offline";

// Endpoint'e göre ayrı zaman aşımı süreleri
// Render free tier cold start 30-60 sn sürebildiği için varsayılan timeout yüksek tutulur.
const DEFAULT_TIMEOUT = 60_000; // 60 sn (cold start payı dahil)
const RISK_TIMEOUT = 90_000; // 90 sn (Wiro AI + cold start payı)

/**
 * Ortak fetch sarmalayıcı - zaman aşımı ve Türkçe hata yönetimi içerir.
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });

    if (!res.ok) {
      // Backend hata gövdesi: { "error": "..." }
      let message = `Sunucu hatası (HTTP ${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {
        // Gövde JSON değilse varsayılan mesajı koru
      }
      throw new Error(message);
    }

    return (await res.json()) as T;
  } catch (err) {
    // Zaman aşımı (AbortController) durumunu Türkçe mesaja çevir
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "İstek zaman aşımına uğradı. Sunucu uyanıyor olabilir, lütfen tekrar deneyin."
      );
    }
    // Ağ hatası (bağlantı yok, sunucuya ulaşılamadı vb.)
    if (err instanceof TypeError) {
      throw new Error("Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  // Sistem sağlık kontrolü
  health: () => request<HealthResponse>("/health"),

  // Deprem enkaz risk skoru (YAVAŞ endpoint - 90 sn timeout)
  getRisk: (body: RiskRequest) =>
    request<RiskResponse>(
      "/api/v1/risk",
      { method: "POST", body: JSON.stringify(body) },
      RISK_TIMEOUT
    ),

  // Güvenli rota
  getRoute: (body: RouteRequest) =>
    request<RouteResponse>("/api/v1/route", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Toplanma alanları
  getAssemblyPoints: () =>
    request<AssemblyPoint[]>("/api/v1/assembly-points"),

  // Offline mesaj senkronizasyonu
  syncMessages: (body: MessageSyncRequest) =>
    request<MessageSyncResponse>("/api/v1/messages/sync", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Offline harita bölgeleri
  getOfflineRegions: () =>
    request<OfflineRegion[]>("/api/v1/offline/regions"),

  // Offline harita paketi
  getOfflineBundle: (regionId: string) =>
    request<OfflineBundle>(`/api/v1/offline/bundle/${regionId}`),
};
