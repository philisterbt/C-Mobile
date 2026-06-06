// Çevrimdışı / P2P bilgi bandı
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Spacing, FontSize } from "../constants/theme";

interface OfflineBannerProps {
  pendingCount: number;
  isConnected?: boolean;
  p2pActive?: boolean;
  connectedPeerCount?: number;
}

export function OfflineBanner({
  pendingCount,
  isConnected = true,
  p2pActive = false,
  connectedPeerCount = 0,
}: OfflineBannerProps) {
  const showP2P = p2pActive && !isConnected;

  return (
    <View
      style={[
        styles.banner,
        showP2P && styles.bannerP2P,
        !isConnected && !showP2P && styles.bannerOffline,
      ]}
    >
      <Text style={styles.icon}>
        {showP2P ? "📴" : isConnected ? "📡" : "📴"}
      </Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>
          {showP2P
            ? "Yakın mesajlaşma aktif"
            : isConnected
              ? "Çevrimiçi"
              : "Çevrimdışı Mod"}
        </Text>
        <Text style={styles.subtitle}>
          {showP2P
            ? `${connectedPeerCount} yakın cihazla internetsiz mesajlaşma`
            : isConnected
              ? "Mesajlar cihazda saklanır; P2P ve sunucu sync desteklenir"
              : p2pActive
                ? `İnternet yok — P2P aktif (${connectedPeerCount} cihaz)`
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
  bannerP2P: {
    backgroundColor: Colors.PRIMARY + "22",
    borderBottomColor: Colors.PRIMARY + "44",
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
