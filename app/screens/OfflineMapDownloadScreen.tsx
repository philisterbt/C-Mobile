// Offline harita indirme ekranı - bölge seçimi, indirme ilerlemesi ve silme
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Spacing, FontSize, Radius } from "../../constants/theme";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useOfflineMap } from "../../hooks/useOfflineMap";

interface OfflineMapDownloadScreenProps {
  onBack: () => void;
}

export function OfflineMapDownloadScreen({ onBack }: OfflineMapDownloadScreenProps) {
  const {
    regions,
    downloaded,
    loading,
    downloading,
    progress,
    error,
    refresh,
    download,
    remove,
  } = useOfflineMap();

  const progressPct =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      <Header title="Offline Harita" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>İndirilebilir Bölgeler</Text>

        {loading ? (
          <ActivityIndicator color={Colors.PRIMARY} style={styles.loader} />
        ) : regions.length === 0 ? (
          <Text style={styles.empty}>Bölge listesi alınamadı. İnterneti kontrol edin.</Text>
        ) : (
          regions.map((region) => {
            const isDownloaded = downloaded.some((d) => d.region_id === region.id);
            return (
              <Card key={region.id} style={styles.card}>
                <Text style={styles.regionName}>{region.name}</Text>
                {region.description && (
                  <Text style={styles.regionDesc}>{region.description}</Text>
                )}
                <Text style={styles.regionSize}>
                  {region.size_mb ? `~${region.size_mb} MB` : "Boyut bilinmiyor"}
                </Text>
                {!isDownloaded ? (
                  <PrimaryButton
                    label={downloading ? "İndiriliyor..." : "İndir"}
                    onPress={() => download(region)}
                    loading={downloading}
                    disabled={downloading}
                    style={styles.btn}
                  />
                ) : (
                  <Text style={styles.downloadedLabel}>✓ İndirildi</Text>
                )}
              </Card>
            );
          })
        )}

        {downloading && (
          <View style={styles.progressBox}>
            <Text style={styles.progressText}>
              Tile indiriliyor: {progress.done}/{progress.total} ({progressPct}%)
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {downloaded.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, styles.sectionGap]}>
              İndirilen Bölgeler
            </Text>
            {downloaded.map((d) => (
              <Card key={d.region_id} style={styles.card}>
                <Text style={styles.regionName}>{d.name}</Text>
                <Text style={styles.regionDesc}>
                  {d.tile_count} tile ·{" "}
                  {new Date(d.downloaded_at).toLocaleDateString("tr-TR")}
                </Text>
                <TouchableOpacity
                  onPress={() => remove(d.region_id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteText}>Sil</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </>
        )}

        <PrimaryButton
          label="Listeyi Yenile"
          variant="secondary"
          onPress={refresh}
          style={styles.refreshBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scroll: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.subtitle,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  sectionGap: {
    marginTop: Spacing.xl,
  },
  loader: {
    marginVertical: Spacing.lg,
  },
  empty: {
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
  card: {
    marginBottom: Spacing.md,
  },
  regionName: {
    fontSize: FontSize.body,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
  },
  regionDesc: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
  },
  regionSize: {
    fontSize: FontSize.caption,
    color: Colors.WARNING,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  btn: {
    marginTop: Spacing.sm,
  },
  downloadedLabel: {
    color: Colors.SAFE,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  progressBox: {
    marginVertical: Spacing.md,
  },
  progressText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: FontSize.caption,
    marginBottom: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.CARD_BG,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.PRIMARY,
  },
  error: {
    color: Colors.PRIMARY,
    textAlign: "center",
    marginVertical: Spacing.md,
  },
  deleteBtn: {
    marginTop: Spacing.sm,
    alignSelf: "flex-start",
  },
  deleteText: {
    color: Colors.PRIMARY,
    fontWeight: "700",
  },
  refreshBtn: {
    marginTop: Spacing.lg,
  },
});
