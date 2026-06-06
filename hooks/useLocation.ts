// Kullanıcının konumunu yöneten hook
// İzin alınamazsa veya hata olursa güvenli bir varsayılan konuma (İstanbul) düşer.
import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";

export interface Coordinate {
  lat: number;
  lng: number;
}

// İzin reddedilirse kullanılacak varsayılan konum (İstanbul / Taksim)
const DEFAULT_LOCATION: Coordinate = { lat: 41.0369, lng: 28.985 };

interface UseLocationResult {
  location: Coordinate;        // Mevcut konum (her zaman bir değer döner)
  loading: boolean;            // Konum alınıyor mu
  permissionGranted: boolean;  // İzin verildi mi
  isDefault: boolean;          // Varsayılan konum mu kullanılıyor
  refresh: () => void;         // Konumu yeniden al
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Coordinate>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isDefault, setIsDefault] = useState(true);

  // Konum iznini iste ve mevcut konumu al
  const fetchLocation = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        // İzin verilmedi - varsayılan konumla devam et
        setPermissionGranted(false);
        setIsDefault(true);
        setLocation(DEFAULT_LOCATION);
        return;
      }

      setPermissionGranted(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setIsDefault(false);
    } catch {
      // Herhangi bir hata durumunda varsayılan konuma düş
      setIsDefault(true);
      setLocation(DEFAULT_LOCATION);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    loading,
    permissionGranted,
    isDefault,
    refresh: fetchLocation,
  };
}
