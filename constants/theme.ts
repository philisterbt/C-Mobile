// Tasarım sistemi sabitleri - boşluk, köşe yarıçapı ve yazı tipi ölçekleri
// Tüm ekranlar bu değerleri kullanarak tutarlı bir görünüm sağlar

// Boşluk ölçeği (margin/padding için)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Köşe yuvarlama ölçeği
export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
} as const;

// Yazı tipi boyut ölçeği
export const FontSize = {
  caption: 12,
  body: 16,
  subtitle: 18,
  title: 22,
  heading: 28,
  display: 48,
} as const;
