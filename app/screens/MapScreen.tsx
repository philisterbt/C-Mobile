// Harita ekranı - online/offline harita, toplanma alanları listesi
import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
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
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from "react-native-maps";
import { Colors } from "../../constants/colors";
import { ISTANBUL_CENTER } from "../../constants/assemblyCoordinates";
import { Spacing, FontSize, Radius } from "../../constants/theme";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { ErrorState } from "../../components/ErrorState";
import { OfflineModeBadge } from "../../components/OfflineModeBadge";
import { useLocation } from "../../hooks/useLocation";
import { useAssemblyPoints } from "../../hooks/useAssemblyPoints";
import { distanceMeters, formatDistance } from "../../utils/geo";
import {
  toMapCoordinate,
  toMapCoordinates,
  isNearAssemblyRegion,
} from "../../utils/coordinates";
import { MAP_VIEW_DEFAULTS, mapViewStyle } from "../../utils/mapConfig";
import { openDirections } from "../../utils/directions";
import { isOnline } from "../../utils/network";
import { getActiveOfflineTileTemplate } from "../../services/offlineMapService";
import { OfflineMapDownloadScreen } from "./OfflineMapDownloadScreen";

const MAP_HEIGHT = 300;

interface MapScreenProps {
  onBack?: () => void;
}

export function MapScreen({ onBack }: MapScreenProps) {
  const { location, loading: locationLoading, isDefault } = useLocation();
  const { points, loading: loadingPoints, error, isOfflineData, reload } =
    useAssemblyPoints();
  const mapRef = useRef<MapView>(null);

  const [showOfflineDownload, setShowOfflineDownload] = useState(false);
  const [connected, setConnected] = useState(true);
  const [offlineTileUrl, setOfflineTileUrl] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const loading = locationLoading || loadingPoints;
  const useOfflineTiles = !connected && offlineTileUrl !== null;

  useEffect(() => {
    isOnline().then(setConnected);
    getActiveOfflineTileTemplate().then(setOfflineTileUrl);
  }, [showOfflineDownload]);

  const sortedPoints = useMemo(() => {
    return points
      .map((point) => ({
        ...point,
        distance: distanceMeters(location, { lat: point.lat, lng: point.lng }),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [points, location]);

  const userNearRegion = useMemo(
    () => isNearAssemblyRegion(location, points),
    [location, points]
  );

  const fitMapToPoints = useCallback(() => {
    if (points.length === 0 || !mapRef.current) return;

    const pointCoords = toMapCoordinates(points);
    const coords =
      userNearRegion && !isDefault
        ? [toMapCoordinate(location), ...pointCoords]
        : pointCoords;

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      animated: true,
    });
  }, [points, location, userNearRegion, isDefault]);

  useEffect(() => {
    if (mapReady && points.length > 0) {
      fitMapToPoints();
    }
  }, [mapReady, points, fitMapToPoints]);

  const focusPoint = useCallback((lat: number, lng: number) => {
    const coord = toMapCoordinate({ lat, lng });
    mapRef.current?.animateToRegion(
      { ...coord, latitudeDelta: 0.012, longitudeDelta: 0.012 },
      400
    );
  }, []);

  const recenter = useCallback(() => {
    if (userNearRegion && !isDefault) {
      mapRef.current?.animateToRegion(
        {
          ...toMapCoordinate(location),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        400
      );
      return;
    }
    fitMapToPoints();
  }, [userNearRegion, isDefault, location, fitMapToPoints]);

  if (showOfflineDownload) {
    return (
      <OfflineMapDownloadScreen
        onBack={() => {
          setShowOfflineDownload(false);
          getActiveOfflineTileTemplate().then(setOfflineTileUrl);
          reload();
        }}
      />
    );
  }

  const initialRegion = {
    ...toMapCoordinate(
      userNearRegion && !isDefault ? location : ISTANBUL_CENTER
    ),
    latitudeDelta: ISTANBUL_CENTER.latitudeDelta,
    longitudeDelta: ISTANBUL_CENTER.longitudeDelta,
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      <Header
        title="Harita"
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={() => setShowOfflineDownload(true)}>
            <Text style={styles.downloadIcon}>⬇️</Text>
          </TouchableOpacity>
        }
      />

      {error && points.length === 0 ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <View style={styles.body}>
          <View style={styles.mapOuter}>
            <View style={styles.mapClip}>
              {Platform.OS === "web" ? (
                <View style={[styles.center, mapViewStyle(MAP_HEIGHT)]}>
                  <Text style={styles.infoText}>
                    Harita yalnızca iOS ve Android cihazlarda görüntülenebilir.
                  </Text>
                </View>
              ) : loading ? (
                <View style={[styles.center, mapViewStyle(MAP_HEIGHT)]}>
                  <ActivityIndicator color={Colors.PRIMARY} size="large" />
                  <Text style={styles.infoText}>Harita yükleniyor...</Text>
                </View>
              ) : (
                <>
                  {useOfflineTiles && <OfflineModeBadge />}
                  <MapView
                    ref={mapRef}
                    provider={PROVIDER_DEFAULT}
                    style={mapViewStyle(MAP_HEIGHT)}
                    mapType={useOfflineTiles ? "none" : "standard"}
                    initialRegion={initialRegion}
                    onMapReady={() => setMapReady(true)}
                    showsUserLocation
                    scrollEnabled
                    zoomEnabled
                    {...MAP_VIEW_DEFAULTS}
                  >
                    {useOfflineTiles && offlineTileUrl && (
                      <UrlTile
                        urlTemplate={offlineTileUrl}
                        maximumZ={16}
                        zIndex={-1}
                        flipY={false}
                      />
                    )}
                    {points.map((point) => (
                      <Marker
                        key={point.name}
                        coordinate={toMapCoordinate(point)}
                        title={point.name}
                        description={`Kapasite: ${point.capacity.toLocaleString("tr-TR")} kişi`}
                        pinColor="green"
                        tracksViewChanges={false}
                      />
                    ))}
                  </MapView>
                  <TouchableOpacity
                    style={styles.recenterButton}
                    onPress={recenter}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.recenterIcon}>◎</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {isDefault && !loading && (
              <Text style={styles.locationHint}>
                Konum izni yok — harita İstanbul toplanma alanlarını gösteriyor.
              </Text>
            )}
            {isOfflineData && (
              <Text style={styles.offlineHint}>
                📴 Offline veri kullanılıyor (indirilen harita paketi)
              </Text>
            )}

            <Text style={styles.sectionTitle}>Yakındaki Toplanma Alanları</Text>
            {!loading && sortedPoints.length === 0 ? (
              <Text style={styles.infoText}>Toplanma alanı bulunamadı.</Text>
            ) : (
              sortedPoints.map((point) => (
                <Card
                  key={point.name}
                  style={styles.pointCard}
                  onPress={() => focusPoint(point.lat, point.lng)}
                >
                  <View style={styles.pointRow}>
                    <View style={styles.dot} />
                    <View style={styles.pointInfo}>
                      <Text style={styles.pointName} numberOfLines={1}>
                        {point.name}
                      </Text>
                      <Text style={styles.pointCoords}>
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </Text>
                      <Text style={styles.pointDistance}>
                        {formatDistance(point.distance)} uzaklıkta
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dirButton}
                      onPress={() => openDirections(point.lat, point.lng)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.dirIcon}>🧭</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  body: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.lg,
  },
  downloadIcon: {
    fontSize: 22,
  },
  mapOuter: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  mapClip: {
    height: MAP_HEIGHT,
    borderRadius: Radius.lg,
    backgroundColor: Colors.CARD_BG,
    position: "relative",
  },
  recenterButton: {
    position: "absolute",
    right: Spacing.md,
    bottom: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  recenterIcon: {
    fontSize: 24,
    color: Colors.PRIMARY,
  },
  center: {
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
  locationHint: {
    fontSize: FontSize.caption,
    color: Colors.WARNING,
    marginBottom: Spacing.sm,
  },
  offlineHint: {
    fontSize: FontSize.caption,
    color: Colors.WARNING,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.subtitle,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  pointCard: {
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.SAFE,
    marginRight: Spacing.md,
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: FontSize.body,
    fontWeight: "600",
    color: Colors.TEXT_PRIMARY,
  },
  pointCoords: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  pointDistance: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  dirButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  dirIcon: {
    fontSize: 18,
  },
});
