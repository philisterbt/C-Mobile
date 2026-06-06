// Offline mesajlaşma tip tanımları - UI katmanı

export type MessageStatus = "pending" | "sent" | "failed";

export interface Message {
  id: string;
  roomId: string;
  text: string;
  sender: string;
  createdAt: string;
  status: MessageStatus;
  isOwn: boolean;
}
