// Alt navigasyon çubuğu - sekmeler arası geçişi yönetir
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Spacing, FontSize } from "../constants/theme";

// Sekme anahtarları - MainTabs ile paylaşılır
export type TabKey = "map" | "route" | "assembly" | "risk" | "messages" | "emergency";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: string;
}

// Alt çubukta gösterilecek sekmeler
const TABS: TabConfig[] = [
  { key: "map", label: "Harita", icon: "🗺️" },
  { key: "route", label: "Rota", icon: "🧭" },
  { key: "assembly", label: "Alanlar", icon: "📍" },
  { key: "risk", label: "Risk", icon: "⚠️" },
  { key: "messages", label: "Mesaj", icon: "💬" },
  { key: "emergency", label: "Acil", icon: "🆘" },
];

interface TabBarProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export function TabBar({ active, onChange }: TabBarProps) {
  // Cihazın alt güvenli alanı (çentik/home bar) için boşluk bırak
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + Spacing.sm }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, !isActive && styles.iconInactive]}>
              {tab.icon}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: Colors.CARD_BG,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2C2C2E",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
  },
  iconInactive: {
    opacity: 0.45,
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: "600",
  },
  labelActive: {
    color: Colors.PRIMARY,
  },
  labelInactive: {
    color: Colors.TEXT_SECONDARY,
  },
});
