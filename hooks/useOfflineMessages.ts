// Offline + P2P mesajlaşma hook'u - oda bazlı sohbet
import { useState, useEffect, useCallback } from "react";
import { DEFAULT_ROOM_ID, ROOM_OPTIONS } from "../constants/rooms";
import {
  getMessagesByRoom,
  getTotalPendingCount,
  markRoomRead,
  getDatabase,
  getPendingMessages,
} from "../services/localDB";
import { getCurrentUserName } from "../services/deviceId";
import { sendLocalMessage } from "../services/messagingService";
import { syncAllRooms } from "../services/messageSync";
import { relayPendingToPeers } from "../services/p2pService";
import { isOnline } from "../utils/network";
import type { Message } from "../types/messaging";
import type { LocalMessage, RoomId } from "../types/offline";

function toUIMessage(m: LocalMessage, currentUser: string): Message {
  return {
    id: m.client_id,
    roomId: m.room_id,
    text: m.content,
    sender: m.sender,
    createdAt: m.created_at,
    status: m.status,
    transport: m.transport ?? null,
    isOwn: m.sender === currentUser,
  };
}

interface UseOfflineMessagesResult {
  messages: Message[];
  loading: boolean;
  pendingCount: number;
  isConnected: boolean;
  roomId: RoomId;
  setRoomId: (roomId: RoomId) => void;
  refresh: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  sync: () => Promise<void>;
  relayPending: () => Promise<void>;
}

export function useOfflineMessages(): UseOfflineMessagesResult {
  const [roomId, setRoomIdState] = useState<RoomId>(DEFAULT_ROOM_ID);
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

      const rows = await getMessagesByRoom(roomId);
      setMessages(rows.map((m) => toUIMessage(m, currentUser)));
      setPendingCount(await getTotalPendingCount());
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const setRoomId = useCallback((nextRoom: RoomId) => {
    setRoomIdState(nextRoom);
  }, []);

  useEffect(() => {
    markRoomRead(roomId);
    refresh();
    isOnline().then((online) => {
      if (online) {
        syncAllRooms(ROOM_OPTIONS.map((r) => r.id))
          .then(refresh)
          .catch(() => {});
      }
    });
  }, [roomId, refresh]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await sendLocalMessage(text, roomId);
      await refresh();
    },
    [roomId, refresh]
  );

  const sync = useCallback(async () => {
    if (!(await isOnline())) return;
    await syncAllRooms(ROOM_OPTIONS.map((r) => r.id));
    await refresh();
  }, [refresh]);

  const relayPending = useCallback(async () => {
    const pending = await getPendingMessages(roomId);
    if (pending.length === 0) return;
    await relayPendingToPeers(
      roomId,
      pending.map((m) => ({
        client_id: m.client_id,
        content: m.content,
        created_at: m.created_at,
      }))
    );
    await refresh();
  }, [roomId, refresh]);

  return {
    messages,
    loading,
    pendingCount,
    isConnected,
    roomId,
    setRoomId,
    refresh,
    sendMessage,
    sync,
    relayPending,
  };
}
