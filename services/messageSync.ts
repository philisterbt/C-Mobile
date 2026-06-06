// Mesaj senkronizasyon servisi - backend /api/v1/messages/sync ile haberleşir
import { api } from "./api";
import { getOrCreateDeviceId } from "./deviceId";
import { CHAT_ROOM_ID } from "../constants/rooms";
import {
  getPendingMessages,
  getLastSync,
  setLastSync,
  upsertIncomingMessage,
  markSent,
} from "./localDB";

/** Tek sohbeti sunucu ile senkronize eder. */
export async function syncMessages(roomId: string): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  const pending = await getPendingMessages(roomId);
  const lastSync = await getLastSync(roomId);

  const data = await api.syncMessages({
    device_id: deviceId,
    room_id: roomId,
    last_sync_at: lastSync,
    outgoing: pending.map((m) => ({
      client_id: m.client_id,
      sender: m.sender,
      content: m.content,
      created_at: m.created_at,
    })),
  });

  for (const msg of data.incoming) {
    await upsertIncomingMessage(msg);
  }

  for (const id of data.acked_client_ids) {
    await markSent(id);
  }

  await setLastSync(roomId, data.server_time);
}

/** Varsayılan sohbet odasını senkronize eder. */
export async function syncChat(): Promise<void> {
  await syncMessages(CHAT_ROOM_ID);
}
