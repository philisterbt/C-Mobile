// Ana sekmeli ekran - uygulama açılışında karşılayan ekran
import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
import { TabBar, type TabKey } from "../../components/TabBar";
import { useNetworkSync } from "../../hooks/useNetworkSync";
import { useLocation } from "../../hooks/useLocation";
import { useRiskAnalysis } from "../../hooks/useRiskAnalysis";
import { startP2PService } from "../../services/p2pService";
import { MapScreen } from "./MapScreen";
import { RouteScreen } from "./RouteScreen";
import { AssemblyScreen } from "./AssemblyScreen";
import { RiskScreen } from "./RiskScreen";
import { EmergencyScreen } from "./EmergencyScreen";
import { MessagesScreen } from "./MessagesScreen";

export function MainTabs() {
  const [active, setActive] = useState<TabKey>("map");
  const [, setSyncTick] = useState(0);

  const { location, loading: locationLoading, isDefault } = useLocation();
  const riskAnalysis = useRiskAnalysis();

  // İnternet gelince mesajları otomatik senkronize et
  useNetworkSync(useCallback(() => setSyncTick((n) => n + 1), []));

  // Uygulama açılınca yakın cihaz keşfi (P2P) başlat
  useEffect(() => {
    startP2PService().catch(() => {});
  }, []);

  // Risk sekmesi açıldığında analiz et; aynı konumda önbellekten göster
  useEffect(() => {
    if (active !== "risk" || locationLoading) return;
    riskAnalysis.analyzeIfNeeded(location.lat, location.lng);
  }, [active, locationLoading, location.lat, location.lng, riskAnalysis.analyzeIfNeeded]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {active === "map" && <MapScreen />}
        {active === "route" && <RouteScreen />}
        {active === "assembly" && <AssemblyScreen />}
        {active === "risk" && (
          <RiskScreen
            location={location}
            isDefault={isDefault}
            locationLoading={locationLoading}
            risk={riskAnalysis}
          />
        )}
        {active === "messages" && <MessagesScreen />}
        {active === "emergency" && <EmergencyScreen />}
      </View>

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
