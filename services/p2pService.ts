// P2P mesajlaşma servisi - yerel afet-p2p modülü (iOS Multipeer Connectivity)
import { Platform } from "react-native";
import {
  start as nativeStart,
  stop as nativeStop,
  sendMessage as nativeSend,
  getPeers as nativeGetPeers,
  addMessageListener,
  addPeerUpdateListener,
  isNativeModuleAvailable,
} from "afet-p2p";
import { getOrCreateDeviceId, getCurrentUserName } from "./deviceId";
import {
  upsertIncomingMessage,
  upsertPeer,
  setPeerConnected,
  markP2PDelivered,
} from "./localDB";
import type { P2PMessagePayload, P2PPeer, P2PStatus } from "../types/p2p";
import type { RoomId } from "../types/offline";

type MessageListener = () => void;
type PeerListener = (peers: P2PPeer[]) => void;

const connectedPeers: Map<string, P2PPeer> = new Map();
const discoveredPeers: Map<string, P2PPeer> = new Map();

let status: P2PStatus = "idle";
let started = false;
let listenersAttached = false;
const messageListeners = new Set<MessageListener>();
const peerListeners = new Set<PeerListener>();
const nativeSubscriptions: Array<{ remove: () => void }> = [];

function notifyPeers(): void {
  const all = getPeerSnapshot();
  peerListeners.forEach((fn) => fn(all));
}

function getPeerSnapshot(): P2PPeer[] {
  const merged = new Map<string, P2PPeer>();
  for (const [id, peer] of discoveredPeers) merged.set(id, peer);
  for (const [id, peer] of connectedPeers) merged.set(id, { ...peer, connected: true });
  return Array.from(merged.values()).sort((a, b) => {
    if (a.connected !== b.connected) return a.connected ? -1 : 1;
    return a.name.localeCompare(b.name, "tr");
  });
}

function syncPeersFromNative(): void {
  if (!isNativeModuleAvailable()) return;
  try {
    const nativePeers = nativeGetPeers();
    discoveredPeers.clear();
    connectedPeers.clear();
    for (const peer of nativePeers) {
      if (peer.connected) {
        connectedPeers.set(peer.peerId, peer);
      } else {
        discoveredPeers.set(peer.peerId, peer);
      }
    }
    notifyPeers();
  } catch {
    // Native modül henüz hazır değil
  }
}

function attachNativeListeners(): void {
  if (listenersAttached || !isNativeModuleAvailable()) return;
  listenersAttached = true;

  nativeSubscriptions.push(
    addPeerUpdateListener(async (event) => {
      const peer: P2PPeer = {
        peerId: event.peerId,
        name: event.name,
        connected: event.connected,
      };

      if (event.connected) {
        connectedPeers.set(event.peerId, peer);
        discoveredPeers.set(event.peerId, peer);
      } else {
        connectedPeers.delete(event.peerId);
        discoveredPeers.set(event.peerId, { ...peer, connected: false });
        await setPeerConnected(event.peerId, false);
      }

      await upsertPeer(peer);
      notifyPeers();
    })
  );

  nativeSubscriptions.push(
    addMessageListener(async (event) => {
      const payload = parsePayload(event.text);
      if (payload) {
        await handleIncomingPayload(payload);
      }
    })
  );
}

function parsePayload(text: string): P2PMessagePayload | null {
  try {
    const data = JSON.parse(text) as P2PMessagePayload;
    if (!data.client_id || !data.room_id || !data.content) return null;
    return data;
  } catch {
    return null;
  }
}

async function handleIncomingPayload(payload: P2PMessagePayload): Promise<void> {
  const inserted = await upsertIncomingMessage(
    {
      client_id: payload.client_id,
      room_id: payload.room_id,
      sender: payload.sender,
      content: payload.content,
      created_at: payload.created_at,
    },
    "p2p"
  );
  if (inserted) {
    messageListeners.forEach((fn) => fn());
  }
}

/** Uygulama açılışında P2P keşif başlatır (yalnızca iOS native build). */
export async function startP2PService(displayName?: string): Promise<P2PStatus> {
  if (Platform.OS === "web") {
    status = "unavailable";
    return status;
  }

  if (!isNativeModuleAvailable()) {
    status = "unavailable";
    return status;
  }

  if (started) return status;

  try {
    attachNativeListeners();
    const name = displayName ?? (await getCurrentUserName());
    status = "starting";
    await nativeStart(name);
    started = true;
    status = "active";
    syncPeersFromNative();
  } catch {
    status = "unavailable";
    started = false;
  }

  notifyPeers();
  return status;
}

/** P2P servisini durdurur. */
export async function stopP2PService(): Promise<void> {
  nativeSubscriptions.forEach((sub) => sub.remove());
  nativeSubscriptions.length = 0;
  listenersAttached = false;

  if (isNativeModuleAvailable()) {
    try {
      await nativeStop();
    } catch {
      // yoksay
    }
  }

  connectedPeers.clear();
  discoveredPeers.clear();
  started = false;
  status = "idle";
  notifyPeers();
}

/** Bağlı peer'lara JSON mesaj yayınlar. */
export async function broadcastP2PMessage(
  roomId: RoomId,
  content: string,
  clientId: string,
  createdAt: string
): Promise<number> {
  if (!isNativeModuleAvailable() || !started) return 0;

  const deviceId = await getOrCreateDeviceId();
  const sender = await getCurrentUserName();
  const payload: P2PMessagePayload = {
    client_id: clientId,
    room_id: roomId,
    sender,
    content,
    created_at: createdAt,
    device_id: deviceId,
  };

  try {
    const delivered = await nativeSend(JSON.stringify(payload));
    if (delivered > 0) {
      await markP2PDelivered(clientId, "p2p");
    }
    return delivered;
  } catch {
    return 0;
  }
}

export function getP2PStatus(): P2PStatus {
  return status;
}

export function getConnectedPeerCount(): number {
  return connectedPeers.size;
}

export function getNearbyPeers(): P2PPeer[] {
  return getPeerSnapshot();
}

export function subscribeP2PMessages(listener: MessageListener): () => void {
  messageListeners.add(listener);
  return () => messageListeners.delete(listener);
}

export function subscribeP2PPeers(listener: PeerListener): () => void {
  peerListeners.add(listener);
  listener(getPeerSnapshot());
  return () => peerListeners.delete(listener);
}

export async function relayPendingToPeers(
  roomId: RoomId,
  messages: Array<{ client_id: string; content: string; created_at: string }>
): Promise<void> {
  if (connectedPeers.size === 0 || messages.length === 0) return;

  for (const msg of messages) {
    await broadcastP2PMessage(roomId, msg.content, msg.client_id, msg.created_at);
  }
}
