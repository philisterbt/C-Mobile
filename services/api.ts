// Backend API servis fonksiyonları - tüm istekler axios üzerinden yapılır
import axios from "axios";
import { API_URL } from "../constants/config";

// Ortak axios örneği - temel URL ve zaman aşımı tanımlı
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Tip Tanımlamaları ---

export interface AssemblyPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
}

export interface RiskScore {
  lat: number;
  lng: number;
  score: number;        // 0 (güvenli) - 100 (çok tehlikeli)
  level: "low" | "medium" | "high" | "critical";
}

export interface SafeRoute {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: Array<{ lat: number; lng: number }>;
  distanceMeters: number;
  durationSeconds: number;
}

// --- API Fonksiyonları ---

/**
 * Backend sunucusunun çalışıp çalışmadığını kontrol eder.
 * @returns Sunucu çalışıyorsa true, değilse hata fırlatır.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await apiClient.get("/health");
    return response.status === 200;
  } catch {
    throw new Error("Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.");
  }
}

/**
 * Sistemdeki tüm toplanma alanlarını getirir.
 * @returns Toplanma alanı listesi
 */
export async function getAssemblyPoints(): Promise<AssemblyPoint[]> {
  try {
    const response = await apiClient.get<AssemblyPoint[]>("/assembly-points");
    return response.data;
  } catch {
    throw new Error("Toplanma alanları yüklenemedi. Lütfen tekrar deneyin.");
  }
}

/**
 * Verilen koordinat için risk skorunu hesaplar.
 * @param lat Enlem
 * @param lng Boylam
 * @returns Risk skoru bilgisi
 */
export async function getRiskScore(lat: number, lng: number): Promise<RiskScore> {
  try {
    const response = await apiClient.get<RiskScore>("/risk-score", {
      params: { lat, lng },
    });
    return response.data;
  } catch {
    throw new Error("Risk skoru hesaplanamadı. Konum bilgisi alınamıyor olabilir.");
  }
}

/**
 * İki nokta arasındaki güvenli tahliye rotasını getirir.
 * @param origin Başlangıç noktası (enlem/boylam)
 * @param destination Hedef nokta (enlem/boylam)
 * @returns Güvenli rota bilgisi
 */
export async function getSafeRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<SafeRoute> {
  try {
    const response = await apiClient.post<SafeRoute>("/safe-route", {
      origin,
      destination,
    });
    return response.data;
  } catch {
    throw new Error("Güvenli rota bulunamadı. Lütfen farklı bir hedef deneyin.");
  }
}
