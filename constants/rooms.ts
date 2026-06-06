// Mesaj odaları - P2P ve backend room_id ile eşleşir
import type { RoomId } from "../types/offline";

export const DEFAULT_ROOM_ID: RoomId = "mahalle";

/** Backend genel sohbet odası (HTTP sync) */
export const SYNC_ROOM_ID: RoomId = "genel";

export interface RoomOption {
  id: RoomId;
  label: string;
  description: string;
}

export const ROOM_OPTIONS: RoomOption[] = [
  { id: "aile", label: "Aile", description: "Yakın aile üyeleri" },
  { id: "mahalle", label: "Mahalle", description: "Sokak / mahalle grubu" },
  { id: "acil", label: "Acil", description: "Acil durum yayını" },
  { id: "genel", label: "Genel", description: "Sunucu senkron sohbeti" },
];

export const EMERGENCY_TEMPLATES = [
  "İyiyim",
  "Yardım lazım",
  "Toplanma alanına gidiyorum",
] as const;

export function getRoomLabel(roomId: RoomId): string {
  return ROOM_OPTIONS.find((r) => r.id === roomId)?.label ?? roomId;
}
