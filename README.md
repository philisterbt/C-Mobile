# Afet Yolu — Mobil Uygulama

Deprem ve afet senaryolarında güvenli tahliye, toplanma alanları, risk analizi ve internetsiz mesajlaşma sağlayan React Native (Expo) uygulaması.

**Backend:** `https://c-backend-2enq.onrender.com`

## Özellikler

| Sekme | Açıklama |
|---|---|
| **Harita** | Konum, toplanma alanları ve risk işaretleri |
| **Rota** | OSRM ile gerçek yürüyüş rotası (kuş bakışı değil) |
| **Alanlar** | Toplanma alanları listesi |
| **Risk** | Konuma göre AI risk analizi (önbellekli) |
| **Mesaj** | Oda bazlı sohbet, P2P yakın mesajlaşma, hazır şablonlar |
| **Acil** | Acil durum bilgileri ve hızlı erişim |

### Mesajlar

- **Odalar:** Aile, Mahalle, Acil, Genel — eşit hizalı dikdörtgen seçiciler
- **Hazır mesajlar:** İyiyim / Yardım lazım / Toplanma alanına gidiyorum
- **Offline-first:** SQLite yerel depolama, internet gelince sunucu sync
- **P2P (iOS native build):** İnternet olmadan yakındaki cihazlarla mesajlaşma

## Kurulum

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

`.env` içinde backend adresini ayarlayın:

```env
EXPO_PUBLIC_API_URL=https://c-backend-2enq.onrender.com
```

## Çalıştırma

### Expo Go (hızlı test — P2P hariç)

```bash
npm start          # Expo Go + offline mod
npm run start:lan  # fiziksel cihaz, aynı WiFi (LAN)
```

1. App Store / Play Store'dan **Expo Go** indirin (SDK 54 uyumlu sürüm)
2. Bilgisayar ve telefon **aynı WiFi** ağında olsun
3. Terminalde çıkan QR kodu tarayın veya `exp://BILGISAYAR-IP:8081` girin

> Farklı ağdaysanız: `npx expo start --tunnel`

### Native build (P2P için — iOS)

P2P modülü Expo Go'da çalışmaz. Yerel native build gerekir:

```bash
npx expo prebuild --clean
npx expo run:ios
```

## Proje Yapısı

```
afet-yolu-mobile/
├── app/
│   ├── index.tsx              # Uygulama kökü → MainTabs
│   └── screens/               # Harita, Rota, Alanlar, Risk, Mesaj, Acil
├── components/                # UI bileşenleri (RoomPicker, QuickTemplates, …)
├── hooks/                     # useOfflineMessages, useP2PMessaging, useRiskAnalysis
├── services/                  # API, localDB, messaging, p2p, roadRouting
├── modules/afet-p2p/          # iOS Multipeer Connectivity (P2P)
├── plugins/withAfetP2p.js     # Expo config plugin (izinler, Bonjour)
├── constants/                 # Renkler, odalar, toplanma koordinatları
└── types/                     # TypeScript tip tanımları
```

## Ortam Değişkenleri

| Değişken | Açıklama |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API adresi |

Expo Go ile test ederken `localhost` yerine bilgisayarınızın yerel IP'sini kullanın.

## Teknolojiler

- **Expo SDK 54** + **React Native 0.81**
- **TypeScript**
- **expo-sqlite** — yerel mesaj ve offline veri
- **react-native-maps** — harita
- **expo-location** — konum
- **OSRM** — yürüyüş rotası (`services/roadRouting.ts`)
- **afet-p2p** — iOS yakın cihaz mesajlaşması (Multipeer Connectivity)

## Bilinen Sınırlamalar

- P2P yalnızca **iOS native build**'de aktif; Android şu an stub
- Risk analizi endpoint'i bazen 502 dönebilir (backend/Wiro AI)
- `npm start` offline mod kullanır; ağ sorunlarında `--offline` tercih edilir
