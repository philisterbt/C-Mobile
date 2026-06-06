// Offline mesajlaşma tip tanımları - UI katmanı
import type { RoomId } from "./offline";

export type MessageStatus = "pending" | "sent" | "failed" | "p2p_delivered";

export interface Message {
  id: string;
  roomId: RoomId;
  text: string;
  sender: string;
  createdAt: string;
  status: MessageStatus;
  transport?: "p2p" | "sync" | "both" | null;
  isOwn: boolean;
}
