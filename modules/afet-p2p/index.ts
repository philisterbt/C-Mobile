import { requireNativeModule, NativeModule } from "expo-modules-core";

export interface AfetP2pPeer {
  peerId: string;
  name: string;
  connected: boolean;
}

export interface AfetP2pMessageEvent {
  text: string;
  peerId: string;
}

export interface AfetP2pPeerEvent {
  peerId: string;
  name: string;
  connected: boolean;
}

declare class AfetP2pModule extends NativeModule<{
  onMessage: (event: AfetP2pMessageEvent) => void;
  onPeerUpdate: (event: AfetP2pPeerEvent) => void;
}> {
  start(displayName: string): Promise<void>;
  stop(): Promise<void>;
  sendMessage(payload: string): Promise<number>;
  getPeers(): AfetP2pPeer[];
}

let nativeModule: AfetP2pModule | null | undefined;

function getNative(): AfetP2pModule | null {
  if (nativeModule !== undefined) return nativeModule;
  try {
    nativeModule = requireNativeModule<AfetP2pModule>("AfetP2p");
    return nativeModule;
  } catch {
    nativeModule = null;
    return null;
  }
}

export function isNativeModuleAvailable(): boolean {
  return getNative() != null;
}

export async function start(displayName: string): Promise<void> {
  const native = getNative();
  if (!native) throw new Error("AfetP2p native modülü kullanılamıyor.");
  return native.start(displayName);
}

export async function stop(): Promise<void> {
  const native = getNative();
  if (!native) return;
  return native.stop();
}

export async function sendMessage(payload: string): Promise<number> {
  const native = getNative();
  if (!native) return 0;
  return native.sendMessage(payload);
}

export function getPeers(): AfetP2pPeer[] {
  const native = getNative();
  if (!native) return [];
  return native.getPeers();
}

export function addMessageListener(
  listener: (event: AfetP2pMessageEvent) => void
): { remove: () => void } {
  const native = getNative();
  if (!native) return { remove: () => {} };
  return native.addListener("onMessage", listener);
}

export function addPeerUpdateListener(
  listener: (event: AfetP2pPeerEvent) => void
): { remove: () => void } {
  const native = getNative();
  if (!native) return { remove: () => {} };
  return native.addListener("onPeerUpdate", listener);
}
