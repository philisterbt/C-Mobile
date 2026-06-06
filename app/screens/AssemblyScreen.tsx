// Toplanma alanları liste ekranı - kullanıcıya en yakın alanları mesafeye göre sıralar
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Spacing, FontSize } from "../../constants/theme";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { ErrorState } from "../../components/ErrorState";
import { CapacityBar } from "../../components/CapacityBar";
import { useLocation } from "../../hooks/useLocation";
import { useAssemblyPoints } from "../../hooks/useAssemblyPoints";
import { distanceMeters, formatDistance } from "../../utils/geo";
import { openDirections } from "../../utils/directions";
import type { AssemblyPoint } from "../../types/api";

interface AssemblyScreenProps {
  // Geri butonu - yalnızca sekme dışı kullanımda verilir
  onBack?: () => void;
}

// Mesafe bilgisiyle zenginleştirilmiş toplanma alanı
interface PointWithDistance extends AssemblyPoint {
  distance: number;
}

export function AssemblyScreen({ onBack }: AssemblyScreenProps) {
  const { location } = useLocation();
  const { points, loading, error, reload } = useAssemblyPoints();

  // En yüksek kapasite - doluluk çubuğunu oranlamak için
  const maxCapacity = useMemo(
    () => points.reduce((max, p) => Math.max(max, p.capacity), 0),
    [points]
  );

  // Alanları kullanıcıya olan mesafeye göre sırala
  const sortedPoints = useMemo<PointWithDistance[]>(() => {
    return points
      .map((point) => ({
        ...point,
        distance: distanceMeters(location, { lat: point.lat, lng: point.lng }),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [points, location]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      <Header title="Toplanma Alanları" onBack={onBack} />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && points.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.PRIMARY} size="large" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedPoints}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={reload}
              tintColor={Colors.PRIMARY}
              colors={[Colors.PRIMARY]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.loadingText}>Toplanma alanı bulunamadı.</Text>
          }
          renderItem={({ item, index }) => (
            <Card style={styles.card}>
              <View style={styles.row}>
                {/* Sıra numarası rozeti */}
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.capacity}>
                    Kapasite: {item.capacity.toLocaleString("tr-TR")} kişi
                  </Text>
                  {/* Kapasite doluluk çubuğu */}
                  <View style={styles.barWrap}>
                    <CapacityBar
                      ratio={maxCapacity > 0 ? item.capacity / maxCapacity : 0}
                    />
                  </View>
                </View>
              </View>

              {/* Alt satır: mesafe + yol tarifi */}
              <View style={styles.footerRow}>
                <Text style={styles.distance}>
                  {formatDistance(item.distance)} uzaklıkta
                </Text>
                <TouchableOpacity
                  style={styles.dirButton}
                  onPress={() => openDirections(item.lat, item.lng)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dirButtonText}>🧭 Yol Tarifi</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FontSize.body,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  list: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.SAFE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: FontSize.body,
    fontWeight: "800",
    color: Colors.SECONDARY,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.body,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
  },
  capacity: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  barWrap: {
    marginTop: Spacing.sm,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  distance: {
    fontSize: FontSize.body,
    fontWeight: "700",
    color: Colors.WARNING,
  },
  dirButton: {
    backgroundColor: Colors.BACKGROUND,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
  },
  dirButtonText: {
    fontSize: FontSize.caption,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
  },
});
