// Güvenli rota ekranı - kullanıcıdan seçilen toplanma alanına risk skoruna göre rota çizer
import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { Colors } from "../../constants/colors";
import { ISTANBUL_CENTER } from "../../constants/assemblyCoordinates";
import { Spacing, FontSize, Radius } from "../../constants/theme";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { ErrorState } from "../../components/ErrorState";
import { useLocation } from "../../hooks/useLocation";
import { useAssemblyPoints } from "../../hooks/useAssemblyPoints";
import { useSafeRoute } from "../../hooks/useSafeRoute";
import { distanceMeters, formatDuration } from "../../utils/geo";
import {
  toMapCoordinate,
  toMapCoordinates,
  isNearAssemblyRegion,
} from "../../utils/coordinates";
import { MAP_VIEW_DEFAULTS, mapViewStyle } from "../../utils/mapConfig";
import { openDirections } from "../../utils/directions";
import type { AssemblyPoint } from "../../types/api";

interface RouteScreenProps {
  onBack?: () => void;
}

function segmentColor(score: number): string {
  if (score < 30) return Colors.SAFE;
  if (score < 60) return Colors.WARNING;
  return Colors.PRIMARY;
}

export function RouteScreen({ onBack }: RouteScreenProps) {
  const { location, loading: locLoading, isDefault } = useLocation();
  const {
    points,
    loading: ptsLoading,
    error: ptsError,
    reload,
  } = useAssemblyPoints();
  const { data: route, loading: routeLoading, error: routeError, load } =
    useSafeRoute();
  const mapRef = useRef<MapView>(null);

  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const sortedPoints = useMemo(() => {
    return [...points].sort(
      (a, b) =>
        distanceMeters(location, { lat: a.lat, lng: a.lng }) -
        distanceMeters(location, { lat: b.lat, lng: b.lng })
    );
  }, [points, location]);

  const destination: AssemblyPoint | null = useMemo(() => {
    if (sortedPoints.length === 0) return null;
    if (selectedName) {
      return sortedPoints.find((p) => p.name === selectedName) ?? sortedPoints[0];
    }
    return sortedPoints[0];
  }, [sortedPoints, selectedName]);

  const userNearRegion = useMemo(
    () => isNearAssemblyRegion(location, points),
    [location, points]
  );

  const runRoute = useCallback(() => {
    if (destination) {
      load(location, { lat: destination.lat, lng: destination.lng });
    }
  }, [load, location, destination]);

  useEffect(() => {
    if (!locLoading && !ptsLoading && destination) {
      runRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locLoading, ptsLoading, destination?.name]);

  const fitRouteOnMap = useCallback(() => {
    if (!mapRef.current || !route || !destination) return;

    const pathCoords = route.path_segments.flatMap((seg) =>
      toMapCoordinates(seg.coordinates)
    );

    const coords =
      pathCoords.length > 0
        ? pathCoords
        : route.segments.flatMap((seg) =>
            toMapCoordinates([seg.start, seg.end])
          );

    coords.push(toMapCoordinate(destination));

    if (userNearRegion && !isDefault) {
      coords.push(toMapCoordinate(location));
    }

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
      animated: true,
    });
  }, [route, destination, location, userNearRegion, isDefault]);

  useEffect(() => {
    if (mapReady && route && destination) {
      fitRouteOnMap();
    }
  }, [mapReady, route, destination, fitRouteOnMap]);

  const loading =
    locLoading || ptsLoading || routeLoading || !route || !destination;
  const error = ptsError || routeError;

  const walkSeconds = route?.duration_seconds ?? 0;

  const initialRegion = useMemo(() => {
    if (destination) {
      const center = userNearRegion && !isDefault
        ? {
            lat: (location.lat + destination.lat) / 2,
            lng: (location.lng + destination.lng) / 2,
          }
        : destination;

      return {
        ...toMapCoordinate(center),
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      };
    }

    return {
      ...toMapCoordinate(ISTANBUL_CENTER),
      latitudeDelta: ISTANBUL_CENTER.latitudeDelta,
      longitudeDelta: ISTANBUL_CENTER.longitudeDelta,
    };
  }, [destination, location, userNearRegion, isDefault]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      <Header title="Güvenli Rota" onBack={onBack} />

      {Platform.OS === "web" ? (
        <View style={styles.center}>
          <Text style={styles.infoText}>
            Rota haritası yalnızca iOS ve Android cihazlarda görüntülenebilir.
          </Text>
        </View>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => (destination ? runRoute() : reload())}
        />
      ) : (
        <View style={styles.flex}>
          {sortedPoints.length > 0 && (
            <View style={styles.pickerWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerContent}
              >
                {sortedPoints.map((p) => {
                  const isActive = destination?.name === p.name;
                  return (
                    <TouchableOpacity
                      key={p.name}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setSelectedName(p.name)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && styles.chipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.PRIMARY} size="large" />
              <Text style={styles.infoText}>Güvenli rota hesaplanıyor...</Text>
            </View>
          ) : (
            <>
              <View style={styles.mapWrap}>
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_DEFAULT}
                  style={mapViewStyle("100%")}
                  initialRegion={initialRegion}
                  onMapReady={() => setMapReady(true)}
                  showsUserLocation
                  {...MAP_VIEW_DEFAULTS}
                >
                  <Marker
                    coordinate={toMapCoordinate(destination)}
                    title={destination.name}
                    pinColor="green"
                    tracksViewChanges={false}
                  />
                  {route.path_segments.map((seg, index) => (
                    <Polyline
                      key={index}
                      coordinates={toMapCoordinates(seg.coordinates)}
                      strokeColor={segmentColor(seg.risk_score)}
                      strokeWidth={5}
                      lineCap="round"
                      lineJoin="round"
                    />
                  ))}
                </MapView>
              </View>

              <View style={styles.legend}>
                <LegendItem color={Colors.SAFE} label="Düşük" />
                <LegendItem color={Colors.WARNING} label="Orta" />
                <LegendItem color={Colors.PRIMARY} label="Yüksek" />
              </View>

              <Card style={styles.infoCard}>
                <Text style={styles.destinationLabel}>Hedef</Text>
                <Text style={styles.destinationName}>{destination.name}</Text>
                <Text style={styles.destinationCoords}>
                  {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </Text>
                {route.follows_roads && (
                  <Text style={styles.routeHint}>
                    Rota sokak ve kaldırımları takip eder (yürüyüş).
                  </Text>
                )}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {route.total_distance.toFixed(1)} km
                    </Text>
                    <Text style={styles.statLabel}>Mesafe</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {formatDuration(walkSeconds)}
                    </Text>
                    <Text style={styles.statLabel}>Yürüme</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text
                      style={[
                        styles.statValue,
                        { color: segmentColor(100 - route.safety_score) },
                      ]}
                    >
                      {route.safety_score}
                    </Text>
                    <Text style={styles.statLabel}>Güvenlik</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() =>
                    openDirections(destination.lat, destination.lng)
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.navButtonText}>Yol Tarifi Başlat</Text>
                </TouchableOpacity>
              </Card>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  mapWrap: {
    flex: 1,
    minHeight: 220,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  infoText: {
    fontSize: FontSize.body,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  pickerWrap: {
    paddingVertical: Spacing.sm,
  },
  pickerContent: {
    paddingHorizontal: Spacing.md,
  },
  chip: {
    backgroundColor: Colors.CARD_BG,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    marginRight: Spacing.sm,
    maxWidth: 200,
  },
  chipActive: {
    backgroundColor: Colors.PRIMARY,
  },
  chipText: {
    fontSize: FontSize.caption,
    fontWeight: "600",
    color: Colors.TEXT_SECONDARY,
  },
  chipTextActive: {
    color: Colors.SECONDARY,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.BACKGROUND,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
  legendLabel: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
  },
  infoCard: {
    margin: Spacing.md,
  },
  destinationLabel: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  destinationName: {
    fontSize: FontSize.title,
    fontWeight: "800",
    color: Colors.TEXT_PRIMARY,
    marginTop: Spacing.xs,
  },
  destinationCoords: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  routeHint: {
    fontSize: FontSize.caption,
    color: Colors.SAFE,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FontSize.subtitle,
    fontWeight: "800",
    color: Colors.SAFE,
  },
  statLabel: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.BACKGROUND,
  },
  navButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  navButtonText: {
    fontSize: FontSize.subtitle,
    fontWeight: "700",
    color: Colors.SECONDARY,
  },
});
