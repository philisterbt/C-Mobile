// İnternet gelince otomatik mesaj senkronizasyonu
import { useEffect } from "react";
import { subscribeNetwork } from "../utils/network";
import { syncChat } from "../services/messageSync";
import { getDatabase } from "../services/localDB";

/** Uygulama açıkken ağ bağlantısı gelince sohbeti senkronize eder. */
export function useNetworkSync(onSynced?: () => void): void {
  useEffect(() => {
    let mounted = true;

    getDatabase().catch(() => {});

    const unsubscribe = subscribeNetwork((online) => {
      if (online && mounted) {
        syncChat()
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
