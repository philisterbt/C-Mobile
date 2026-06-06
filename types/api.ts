// Backend API tip tanımları - dökümantasyona birebir uygundur

export interface Coordinate {
  lat: number;
  lng: number;
}

// Risk seviyeleri - backend Türkçe döner
export type RiskLevel = "DÜŞÜK" | "ORTA" | "YÜKSEK";

// --- Risk endpoint ---
export interface RiskRequest {
  lat: number;
  lng: number;
}

export interface RiskResponse {
  score: number;            // 0-100 arası risk skoru
  level: RiskLevel;
  comment: string;          // Bölge deprem değerlendirmesi
  recommendations: string[]; // Öneriler listesi
  analyzed_at: string;      // ISO tarih
}

// --- Route endpoint ---
export interface RouteRequest {
  origin: Coordinate;
  destination: Coordinate;
}

export interface RouteSegment {
  start: Coordinate;
  end: Coordinate;
  risk_score: number;
}

/** Harita üzerinde çizilecek yol parçası (sokak/sidewalk geometrisi). */
export interface RoutePathSegment {
  coordinates: Coordinate[];
  risk_score: number;
}

export interface RouteResponse {
  segments: RouteSegment[];
  /** OSRM vb. ile hesaplanmış gerçek yol geometrisi */
  path_segments: RoutePathSegment[];
  total_distance: number;   // kilometre
  duration_seconds: number; // yürüyüş süresi (saniye)
  safety_score: number;     // 0-100 güvenlik skoru
  assembly_point: Coordinate;
  /** true ise path_segments sokak rotasını takip eder */
  follows_roads: boolean;
}

// --- Assembly points endpoint ---
export interface AssemblyPoint {
  name: string;
  lat: number;
  lng: number;
  capacity: number;
}

// --- Health endpoint ---
export interface HealthResponse {
  status: string;
  service: string;
}
