// Offline mesajlaşma hook'u - tek sohbet, SQLite + backend sync
import { useState, useEffect, useCallback } from "react";
import { CHAT_ROOM_ID } from "../constants/rooms";
import {
  getMessagesByRoom,
  getTotalPendingCount,
  markRoomRead,
  getDatabase,
} from "../services/localDB";
import { getCurrentUserName } from "../services/deviceId";
import { sendLocalMessage } from "../services/messagingService";
import { syncChat } from "../services/messageSync";
import { isOnline } from "../utils/network";
import type { Message } from "../types/messaging";
import type { LocalMessage } from "../types/offline";

function toUIMessage(m: LocalMessage, currentUser: string): Message {
  return {
    id: m.client_id,
    roomId: m.room_id,
    text: m.content,
    sender: m.sender,
    createdAt: m.created_at,
    status: m.status,
    isOwn: m.sender === currentUser,
  };
}

interface UseOfflineMessagesResult {
  messages: Message[];
  loading: boolean;
  pendingCount: number;
  isConnected: boolean;
  refresh: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  sync: () => Promise<void>;
}

export function useOfflineMessages(): UseOfflineMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await getDatabase();
      const currentUser = await getCurrentUserName();
      const online = await isOnline();
      setIsConnected(online);

      const rows = await getMessagesByRoom(CHAT_ROOM_ID);
      setMessages(rows.map((m) => toUIMessage(m, currentUser)));
      setPendingCount(await getTotalPendingCount());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    markRoomRead(CHAT_ROOM_ID);
    refresh();
    isOnline().then((online) => {
      if (online) {
        syncChat().then(refresh).catch(() => {});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await sendLocalMessage(text);
      await refresh();
    },
    [refresh]
  );

  const sync = useCallback(async () => {
    if (!(await isOnline())) return;
    await syncChat();
    await refresh();
  }, [refresh]);

  return {
    messages,
    loading,
    pendingCount,
    isConnected,
    refresh,
    sendMessage,
    sync,
  };
}
