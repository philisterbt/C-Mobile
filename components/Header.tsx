// Ekran başlığı bileşeni - opsiyonel geri butonu ve başlık gösterir
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/colors";
import { Spacing, FontSize } from "../constants/theme";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({ title, onBack, rightAction }: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Geri butonu - yalnızca onBack verilmişse gösterilir */}
      {onBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Sağ aksiyon veya simetri boşluğu */}
      <View style={styles.backButton}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 36,
    color: Colors.TEXT_PRIMARY,
    fontWeight: "300",
    marginTop: -4,
  },
  title: {
    flex: 1,
    fontSize: FontSize.title,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
    textAlign: "center",
  },
});
