// Risk seviyesi rozeti - seviyeye göre renk ve Türkçe etiket gösterir
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Radius, Spacing, FontSize } from "../constants/theme";
import type { RiskLevel } from "../types/api";

interface RiskBadgeProps {
  level: RiskLevel;
}

// Risk seviyesini renk ve etikete eşleyen tablo
const LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string }> = {
  DÜŞÜK: { label: "Düşük Risk", color: Colors.SAFE },
  ORTA: { label: "Orta Risk", color: Colors.WARNING },
  YÜKSEK: { label: "Yüksek Risk", color: Colors.PRIMARY },
};

export function RiskBadge({ level }: RiskBadgeProps) {
  const config = LEVEL_CONFIG[level];

  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: "700",
    color: Colors.SECONDARY,
    letterSpacing: 0.5,
  },
});
