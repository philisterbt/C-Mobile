// P2P yakın mesajlaşma hook'u - peer listesi ve servis durumu
import { useState, useEffect, useCallback, useRef } from "react";
import {
  startP2PService,
  stopP2PService,
  subscribeP2PPeers,
  subscribeP2PMessages,
  getP2PStatus,
  getConnectedPeerCount,
} from "../services/p2pService";
import type { P2PPeer, P2PStatus } from "../types/p2p";

interface UseP2PMessagingResult {
  status: P2PStatus;
  peers: P2PPeer[];
  connectedCount: number;
  isNearbyActive: boolean;
  restart: () => Promise<void>;
}

export function useP2PMessaging(
  onMessageReceived?: () => void
): UseP2PMessagingResult {
  const [status, setStatus] = useState<P2PStatus>(getP2PStatus());
  const [peers, setPeers] = useState<P2PPeer[]>([]);
  const [connectedCount, setConnectedCount] = useState(getConnectedPeerCount());
  const onMessageRef = useRef(onMessageReceived);
  onMessageRef.current = onMessageReceived;

  const restart = useCallback(async () => {
    await stopP2PService();
    const next = await startP2PService();
    setStatus(next);
    setConnectedCount(getConnectedPeerCount());
  }, []);

  useEffect(() => {
    let mounted = true;

    startP2PService().then((next) => {
      if (mounted) {
        setStatus(next);
        setConnectedCount(getConnectedPeerCount());
      }
    });

    const unsubPeers = subscribeP2PPeers((nextPeers) => {
      if (mounted) {
        setPeers(nextPeers);
        setConnectedCount(nextPeers.filter((p) => p.connected).length);
      }
    });

    const unsubMessages = subscribeP2PMessages(() => {
      onMessageRef.current?.();
    });

    return () => {
      mounted = false;
      unsubPeers();
      unsubMessages();
    };
  }, []);

  return {
    status,
    peers,
    connectedCount,
    isNearbyActive: status === "active",
    restart,
  };
}
