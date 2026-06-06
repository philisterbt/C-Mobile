// Ana sekmeli ekran - uygulama açılışında karşılayan ekran
import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { TabBar, type TabKey } from "../../components/TabBar";
import { useNetworkSync } from "../../hooks/useNetworkSync";
import { MapScreen } from "./MapScreen";
import { RouteScreen } from "./RouteScreen";
import { AssemblyScreen } from "./AssemblyScreen";
import { RiskScreen } from "./RiskScreen";
import { EmergencyScreen } from "./EmergencyScreen";
import { MessagesScreen } from "./MessagesScreen";

export function MainTabs() {
  const [active, setActive] = useState<TabKey>("map");
  const [, setSyncTick] = useState(0);

  // İnternet gelince mesajları otomatik senkronize et
  useNetworkSync(useCallback(() => setSyncTick((n) => n + 1), []));

  return (
    <View style={styles.container}>
      {/* Aktif sekmenin içeriği */}
      <View style={styles.content}>
        {active === "map" && <MapScreen />}
        {active === "route" && <RouteScreen />}
        {active === "assembly" && <AssemblyScreen />}
        {active === "risk" && <RiskScreen />}
        {active === "messages" && <MessagesScreen />}
        {active === "emergency" && <EmergencyScreen />}
      </View>

      {/* Alt navigasyon çubuğu */}
      <TabBar active={active} onChange={setActive} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  content: {
    flex: 1,
  },
});
