// Harita ortak ayarları — Android marker kayması için LEGACY renderer
import { Platform, type ViewStyle } from "react-native";
import type { MapViewProps } from "react-native-maps";

/** Android'de yeni Google Maps renderer marker konumunu kaydırabiliyor. */
export const MAP_VIEW_DEFAULTS: Partial<MapViewProps> = {
  ...(Platform.OS === "android" ? { googleRenderer: "LEGACY" } : {}),
  rotateEnabled: false,
  pitchEnabled: false,
  loadingEnabled: true,
};

/** MapView için güvenli stil — flex yerine açık boyut kullan. */
export function mapViewStyle(height: number | "100%"): ViewStyle {
  return {
    width: "100%",
    height: height === "100%" ? "100%" : height,
  };
}
