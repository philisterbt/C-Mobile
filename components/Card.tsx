// Kart bileşeni - içeriği koyu kart arka planında gruplar
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import { Colors } from "../constants/colors";
import { Radius, Spacing } from "../constants/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  // onPress verilmişse tıklanabilir kart, verilmemişse statik kart döndür
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
});
