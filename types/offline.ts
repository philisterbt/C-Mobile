// Offline harita ve mesaj senkronizasyon tip tanımları

import type { AssemblyPoint } from "./api";

// Mesaj odaları
export type RoomId = "genel" | "aile" | "mahalle" | "acil";

// SQLite'da saklanan yerel mesaj
export interface LocalMessage {
  client_id: string;
  room_id: RoomId;
  sender: string;
  content: string;
  created_at: string;
  status: "pending" | "sent" | "failed";
}

// Sunucudan gelen mesaj
export interface IncomingMessage {
  client_id?: string;
  room_id: string;
  sender: string;
  content: string;
  created_at: string;
}

// POST /api/v1/messages/sync istek gövdesi
export interface MessageSyncRequest {
  device_id: string;
  room_id: string;
  last_sync_at: string | null;
  outgoing: Array<{
    client_id: string;
    sender: string;
    content: string;
    created_at: string;
  }>;
}

// POST /api/v1/messages/sync yanıt
export interface MessageSyncResponse {
  incoming: IncomingMessage[];
  acked_client_ids: string[];
  server_time: string;
}

// GET /api/v1/offline/regions
export interface OfflineRegion {
  id: string;
  name: string;
  size_mb?: number;
  description?: string;
}

// GET /api/v1/offline/bundle/:id
export interface OfflineBundle {
  region: {
    min_lat: number;
    max_lat: number;
    min_lng: number;
    max_lng: number;
    min_zoom: number;
    max_zoom: number;
  };
  tile_config: {
    url_template: string;
  };
  assembly_points: AssemblyPoint[];
  emergency_tips: string[];
}

// İndirilmiş bölge kaydı
export interface DownloadedRegion {
  region_id: string;
  name: string;
  downloaded_at: string;
  tile_count: number;
}
