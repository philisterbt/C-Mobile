// Mesaj gönderme servisi - offline-first + P2P + HTTP sync
import * as Crypto from "expo-crypto";
import { insertMessage } from "./localDB";
import { getCurrentUserName } from "./deviceId";
import { syncMessages } from "./messageSync";
import { broadcastP2PMessage, getConnectedPeerCount } from "./p2pService";
import { isOnline } from "../utils/network";
import type { LocalMessage, RoomId } from "../types/offline";

/** Mesajı yerel DB'ye kaydeder, P2P ve/veya sunucuya iletir. */
export async function sendLocalMessage(
  content: string,
  roomId: RoomId
): Promise<LocalMessage> {
  const sender = await getCurrentUserName();
  const msg: LocalMessage = {
    client_id: Crypto.randomUUID(),
    room_id: roomId,
    sender,
    content: content.trim(),
    created_at: new Date().toISOString(),
    status: "pending",
    transport: null,
  };

  await insertMessage(msg);

  const p2pCount = getConnectedPeerCount();
  if (p2pCount > 0) {
    await broadcastP2PMessage(
      roomId,
      msg.content,
      msg.client_id,
      msg.created_at
    );
  }

  if (await isOnline()) {
    try {
      await syncMessages(roomId);
    } catch {
      // Pending kalır
    }
  }

  return msg;
}
