// Genel amaçlı buton bileşeni - üç farklı görünüm (variant) destekler
import React from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  type ViewStyle,
} from "react-native";
import { Colors } from "../constants/colors";
import { Radius, Spacing, FontSize } from "../constants/theme";

type ButtonVariant = "primary" | "secondary" | "outline";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  // Seçilen variant'a göre kap (container) stilini belirle
  const containerStyle = [
    styles.base,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "outline" && styles.outline,
    (disabled || loading) && styles.disabled,
    style,
  ];

  // Variant'a göre metin rengini belirle
  const textStyle = [
    styles.label,
    variant === "outline" && styles.outlineLabel,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.SECONDARY} />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  primary: {
    backgroundColor: Colors.PRIMARY,
  },
  secondary: {
    backgroundColor: Colors.CARD_BG,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.TEXT_SECONDARY,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: FontSize.subtitle,
    fontWeight: "700",
    color: Colors.SECONDARY,
    letterSpacing: 0.5,
  },
  outlineLabel: {
    color: Colors.TEXT_PRIMARY,
  },
});
