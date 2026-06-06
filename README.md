# Afet Yolu - Mobil Uygulama

Güvenli tahliye navigasyonu sağlayan React Native (Expo) uygulaması.

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npx expo start
```

## iOS Cihazdan Görme (Expo Go)

1. App Store'dan **"Expo Go"** uygulamasını indir
2. Terminalde şu komutu çalıştır:
   ```bash
   npx expo start
   ```
3. Terminalde QR kodu çıkacak
4. **iPhone kamerasıyla QR kodu tara**
5. Expo Go otomatik açılacak ve uygulamayı göreceksin

> **Önemli:** iPhone ve bilgisayar **aynı WiFi ağında** olmalı.

### Farklı Ağda Çalışmak

Farklı ağlardaysanız (örneğin mobil veri ile bilgisayar WiFi'da) tunnel modunu kullan:

```bash
npx expo start --tunnel
```

Bu komut ngrok kullanarak internet üzerinden bağlantı kurar.

## Proje Yapısı

```
afet-yolu-mobile/
├── app/
│   └── index.tsx         # Ana karşılama ekranı
├── components/           # Yeniden kullanılabilir bileşenler
├── services/
│   └── api.ts            # Backend API çağrıları
├── constants/
│   ├── colors.ts         # Renk paleti
│   └── config.ts         # API URL ve uygulama ayarları
├── hooks/                # Özel React hook'ları
├── .env                  # Ortam değişkenleri (git'e ekleme)
├── .env.example          # Ortam değişkeni şablonu
└── app.json              # Expo yapılandırması
```

## Ortam Değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayıp değerleri doldur:

```bash
cp .env.example .env
```

| Değişken | Açıklama | Örnek |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Backend sunucu adresi | `http://192.168.1.10:8080` |

> **Not:** Expo Go ile test ederken `localhost` yerine bilgisayarının yerel IP adresini kullan.

## Teknolojiler

- **React Native** + **Expo** (SDK 56)
- **TypeScript** (strict mode)
- **axios** - HTTP istekleri
- **expo-location** - Konum servisleri
- **expo-camera** - Kamera erişimi
- **react-native-maps** - Harita bileşeni
- **@react-native-async-storage/async-storage** - Yerel depolama
- **expo-network** - Ağ durumu kontrolü
