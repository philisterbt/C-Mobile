// Harici harita uygulamasında yürüyüş yol tarifi açar (Apple Maps / Google Maps)
import { Linking, Platform } from "react-native";

/**
 * Verilen koordinata yürüyüş navigasyonu başlatır.
 * iOS'ta Apple Maps, Android'de Google Maps açılır; başarısız olursa
 * tarayıcı tabanlı Google Maps'e düşülür.
 */
export async function openDirections(lat: number, lng: number): Promise<void> {
  const latlng = `${lat},${lng}`;
  // Tüm platformlarda çalışan güvenli yedek bağlantı (yürüyüş modu)
  const fallback = `https://www.google.com/maps/dir/?api=1&destination=${latlng}&travelmode=walking`;

  // Platforma özel yerel uygulama bağlantısı
  const nativeUrl =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${latlng}&dirflg=w`
      : `google.navigation:q=${latlng}&mode=w`;

  try {
    const supported = await Linking.canOpenURL(nativeUrl);
    await Linking.openURL(supported ? nativeUrl : fallback);
  } catch {
    // Yerel uygulama açılamazsa tarayıcı bağlantısını dene
    try {
      await Linking.openURL(fallback);
    } catch {
      // Sessizce yut - kullanıcıya gösterilecek ek bir aksiyon yok
    }
  }
}
