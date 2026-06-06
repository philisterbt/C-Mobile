// İnternet gelince otomatik mesaj senkronizasyonu
import { useEffect } from "react";
import { ROOM_OPTIONS } from "../constants/rooms";
import { subscribeNetwork } from "../utils/network";
import { syncAllRooms } from "../services/messageSync";
import { getDatabase } from "../services/localDB";

/** Uygulama açıkken ağ bağlantısı gelince tüm odaları senkronize eder. */
export function useNetworkSync(onSynced?: () => void): void {
  useEffect(() => {
    let mounted = true;

    getDatabase().catch(() => {});

    const unsubscribe = subscribeNetwork((online) => {
      if (online && mounted) {
        syncAllRooms(ROOM_OPTIONS.map((r) => r.id))
          .then(() => onSynced?.())
          .catch(() => {});
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [onSynced]);
}
