// Oda seçici ve hazır mesaj satırları — ortak dikdörtgen hizalama
import { Platform, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Spacing, FontSize } from "../constants/theme";

export const RECT_CHIP_HEIGHT = 40;
export const RECT_CHIP_GAP = Spacing.sm;

export const rectChipStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: RECT_CHIP_GAP,
    backgroundColor: Colors.BACKGROUND,
  },
  card: {
    height: RECT_CHIP_HEIGHT,
    backgroundColor: Colors.CARD_BG,
    borderWidth: 1,
    borderColor: "#3A3A3C",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: "500",
    color: Colors.TEXT_PRIMARY,
    textAlign: "center",
    lineHeight: 16,
    ...(Platform.OS === "android" ? { includeFontPadding: false, textAlignVertical: "center" as const } : {}),
  },
});
