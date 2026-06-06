// Uygulama renk paleti - yüksek kontrastlı ve minimalist tasarım
export const Colors = {
  // Arka plan renkleri
  BACKGROUND: "#0A0A0A",   // Koyu siyah ana arka plan
  CARD_BG: "#1C1C1E",      // Koyu kart arka planı

  // Ana renkler
  PRIMARY: "#FF3B30",      // Acil kırmızı - tehlike ve eylem butonu
  SECONDARY: "#FFFFFF",    // Beyaz - ikincil öğeler
  WARNING: "#FF9500",      // Turuncu - uyarı bildirimleri
  SAFE: "#34C759",         // Yeşil - güvenli bölge ve onay

  // Metin renkleri
  TEXT_PRIMARY: "#FFFFFF",   // Beyaz - birincil metin
  TEXT_SECONDARY: "#8E8E93", // Gri - ikincil ve açıklama metni
} as const;

export type ColorKey = keyof typeof Colors;
