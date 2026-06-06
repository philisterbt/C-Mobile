// Cihaz kimliği ve kullanıcı adı yönetimi
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const DEVICE_ID_KEY = "@afet_yolu/device_id";
const USER_NAME_KEY = "@afet_yolu/user_name";
const DEFAULT_USER_NAME = "Ben";

/** Benzersiz cihaz kimliği oluşturur veya mevcut olanı döndürür. */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

/** Mesaj gönderen adını döndürür. */
export async function getCurrentUserName(): Promise<string> {
  const name = await AsyncStorage.getItem(USER_NAME_KEY);
  return name?.trim() || DEFAULT_USER_NAME;
}

/** Kullanıcı adını kaydeder. */
export async function setCurrentUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(USER_NAME_KEY, name.trim() || DEFAULT_USER_NAME);
}
