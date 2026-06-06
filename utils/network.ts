// Ağ durumu yardımcıları
import NetInfo from "@react-native-community/netinfo";

/** Cihazın internete bağlı olup olmadığını kontrol eder. */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
}

/** Ağ durumu değişikliklerini dinler. */
export function subscribeNetwork(callback: (online: boolean) => void): () => void {
  return NetInfo.addEventListener((state) => {
    const online = state.isConnected === true && state.isInternetReachable !== false;
    callback(online);
  });
}
