// Yakındaki Afet Yolu cihazları paneli
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/colors";
import { Spacing, FontSize, Radius } from "../constants/theme";
import type { P2PPeer } from "../types/p2p";

interface NearbyPeersPanelProps {
  peers: P2PPeer[];
  connectedCount: number;
  expanded: boolean;
  onToggle: () => void;
}

export function NearbyPeersPanel({
  peers,
  connectedCount,
  expanded,
  onToggle,
}: NearbyPeersPanelProps) {
  const discoveredCount = peers.length;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.header} onPress={onToggle} activeOpacity={0.8}>
        <Text style={styles.title}>
          Yakındaki cihazlar · {connectedCount} bağlı
          {discoveredCount > connectedCount
            ? ` / ${discoveredCount} keşfedildi`
            : ""}
        </Text>
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.list}>
          {peers.length === 0 ? (
            <Text style={styles.empty}>
              Henüz yakında Afet Yolu cihazı yok (~10–30 m)
            </Text>
          ) : (
            peers.map((peer) => (
              <View key={peer.peerId} style={styles.row}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: peer.connected ? Colors.SAFE : Colors.WARNING },
                  ]}
                />
                <Text style={styles.name} numberOfLines={1}>
                  {peer.name}
                </Text>
                <Text style={styles.state}>
                  {peer.connected ? "Bağlı" : "Keşfedildi"}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.CARD_BG,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.caption,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
  },
  chevron: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginLeft: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  empty: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    fontStyle: "italic",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: FontSize.caption,
    color: Colors.TEXT_PRIMARY,
  },
  state: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
  },
});
