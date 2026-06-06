// Çevrimdışı mod bilgi bandı - bağlantı ve bekleyen mesaj durumu
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Spacing, FontSize } from "../constants/theme";

interface OfflineBannerProps {
  pendingCount: number;
  isConnected?: boolean;
}

export function OfflineBanner({ pendingCount, isConnected = true }: OfflineBannerProps) {
  return (
    <View style={[styles.banner, !isConnected && styles.bannerOffline]}>
      <Text style={styles.icon}>{isConnected ? "📡" : "📴"}</Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>
          {isConnected ? "Çevrimiçi" : "Çevrimdışı Mod"}
        </Text>
        <Text style={styles.subtitle}>
          {isConnected
            ? "Mesajlar cihazda saklanır ve sunucuya senkronize edilir"
            : "İnternet yok — mesajlar yerelde bekletiliyor"}
          {pendingCount > 0 ? ` · ${pendingCount} bekliyor` : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.SAFE + "22",
    borderBottomWidth: 1,
    borderBottomColor: Colors.SAFE + "44",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bannerOffline: {
    backgroundColor: Colors.WARNING + "22",
    borderBottomColor: Colors.WARNING + "44",
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.caption,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
});
