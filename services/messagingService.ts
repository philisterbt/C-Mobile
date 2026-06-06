// Mesaj gönderme servisi - offline-first akış (tek sohbet)
import * as Crypto from "expo-crypto";
import { insertMessage } from "./localDB";
import { getCurrentUserName } from "./deviceId";
import { syncChat } from "./messageSync";
import { isOnline } from "../utils/network";
import { CHAT_ROOM_ID } from "../constants/rooms";
import type { LocalMessage } from "../types/offline";

/** Mesajı önce yerel DB'ye kaydeder, internet varsa senkronize eder. */
export async function sendLocalMessage(content: string): Promise<LocalMessage> {
  const sender = await getCurrentUserName();
  const msg: LocalMessage = {
    client_id: Crypto.randomUUID(),
    room_id: CHAT_ROOM_ID,
    sender,
    content: content.trim(),
    created_at: new Date().toISOString(),
    status: "pending",
  };

  await insertMessage(msg);

  if (await isOnline()) {
    try {
      await syncChat();
    } catch {
      // Pending kalır
    }
  }

  return msg;
}
