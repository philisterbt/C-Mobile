// Kapasite doluluk çubuğu - bir toplanma alanının kapasitesini görsel olarak gösterir
import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Radius } from "../constants/theme";

interface CapacityBarProps {
  // 0 ile 1 arasında doluluk oranı (kapasite / en yüksek kapasite)
  ratio: number;
}

export function CapacityBar({ ratio }: CapacityBarProps) {
  // Oranı 0-1 aralığına sıkıştır
  const clamped = Math.max(0, Math.min(1, ratio));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.BACKGROUND,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: Radius.full,
    backgroundColor: Colors.SAFE,
  },
});
