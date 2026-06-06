// Uygulama genel yapılandırma sabitleri

// Backend API adresi - .env dosyasından okunur, yoksa canlı sunucu kullanılır
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://c-backend-2enq.onrender.com";

// Yürüyüş rotası — OpenStreetMap tabanlı OSRM (kuş bakışı değil, gerçek yol)
export const OSRM_URL =
  process.env.EXPO_PUBLIC_OSRM_URL ?? "https://router.project-osrm.org";

// Uygulama adı
export const APP_NAME = "Afet Yolu";

// Uygulama versiyonu
export const VERSION = "1.0.0";
