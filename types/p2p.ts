// P2P mesaj wire formatı - backend sync ile uyumlu
import type { RoomId } from "./offline";

export interface P2PMessagePayload {
  client_id: string;
  room_id: RoomId;
  sender: string;
  content: string;
  created_at: string;
  device_id: string;
}

export interface P2PPeer {
  peerId: string;
  name: string;
  connected: boolean;
}

export type P2PStatus = "idle" | "starting" | "active" | "unavailable";
