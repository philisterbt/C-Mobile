// Harita üzerinde offline mod rozeti
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Spacing, FontSize, Radius } from "../constants/theme";

export function OfflineModeBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>📴 Offline Mod</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.WARNING,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    zIndex: 10,
  },
  text: {
    fontSize: FontSize.caption,
    fontWeight: "700",
    color: Colors.SECONDARY,
  },
});
