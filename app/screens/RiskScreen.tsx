// Risk skoru ekranı - kullanıcının bulunduğu konumun deprem enkaz risk skorunu gösterir
// Backend (Wiro AI) yavaş olduğu için analiz ~15-60 sn sürebilir; net loading gösterilir.
import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Spacing, FontSize } from "../../constants/theme";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { RiskBadge } from "../../components/RiskBadge";
import { ErrorState } from "../../components/ErrorState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useLocation } from "../../hooks/useLocation";
import { useRiskAnalysis } from "../../hooks/useRiskAnalysis";
import type { RiskLevel } from "../../types/api";

interface RiskScreenProps {
  // Geri butonu - yalnızca sekme dışı kullanımda verilir
  onBack?: () => void;
}

// Risk seviyesine göre skor halkasının rengi
const LEVEL_COLOR: Record<RiskLevel, string> = {
  DÜŞÜK: Colors.SAFE,
  ORTA: Colors.WARNING,
  YÜKSEK: Colors.PRIMARY,
};

export function RiskScreen({ onBack }: RiskScreenProps) {
  const { location, isDefault, loading: locationLoading } = useLocation();
  const { data: risk, loading, error, analyze } = useRiskAnalysis();

  // Konum hazır olunca risk analizini başlat
  const runAnalysis = useCallback(() => {
    analyze(location.lat, location.lng);
  }, [analyze, location]);

  useEffect(() => {
    if (!locationLoading) {
      runAnalysis();
    }
    // location hazır olduğunda yalnızca bir kez tetiklensin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationLoading]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      <Header title="Risk Skoru" onBack={onBack} />

      {error ? (
        <ErrorState message={error} onRetry={runAnalysis} />
      ) : loading || locationLoading || !risk ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.PRIMARY} size="large" />
          <Text style={styles.loadingText}>Risk analizi yapılıyor...</Text>
          <Text style={styles.loadingHint}>
            Bu işlem yapay zeka analizi nedeniyle bir dakikaya kadar sürebilir.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Büyük skor halkası */}
          <View style={styles.scoreSection}>
            <View
              style={[
                styles.scoreCircle,
                { borderColor: LEVEL_COLOR[risk.level] },
              ]}
            >
              <Text style={styles.scoreValue}>{risk.score}</Text>
              <Text style={styles.scoreMax}>/ 100</Text>
            </View>
            <View style={styles.badgeWrap}>
              <RiskBadge level={risk.level} />
            </View>
          </View>

          {/* Bölge değerlendirme yorumu */}
          {risk.comment ? (
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>Bölge Değerlendirmesi</Text>
              <Text style={styles.commentText}>{risk.comment}</Text>
            </Card>
          ) : null}

          {/* Öneriler listesi */}
          {risk.recommendations && risk.recommendations.length > 0 ? (
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>Öneriler</Text>
              {risk.recommendations.map((rec, index) => (
                <View key={index} style={styles.recItem}>
                  <Text style={styles.recBullet}>•</Text>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </Card>
          ) : null}

          {/* Konum bilgisi kartı */}
          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Konum</Text>
            <Text style={styles.cardValue}>
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </Text>
            {isDefault && (
              <Text style={styles.warning}>
                Konum izni verilmedi - varsayılan konum kullanılıyor.
              </Text>
            )}
            <Text style={styles.analyzedAt}>
              Analiz: {formatAnalyzedAt(risk.analyzed_at)}
            </Text>
          </Card>

          <PrimaryButton
            label="Yenile"
            variant="secondary"
            onPress={runAnalysis}
            style={styles.refreshButton}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ISO tarihini okunabilir yerel saate çevirir
function formatAnalyzedAt(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scroll: {
    padding: Spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    fontSize: FontSize.subtitle,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
    marginTop: Spacing.md,
  },
  loadingHint: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  scoreValue: {
    fontSize: 60,
    fontWeight: "800",
    color: Colors.TEXT_PRIMARY,
  },
  scoreMax: {
    fontSize: FontSize.body,
    color: Colors.TEXT_SECONDARY,
    marginTop: -Spacing.sm,
  },
  badgeWrap: {
    alignItems: "center",
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  commentText: {
    fontSize: FontSize.body,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
  cardValue: {
    fontSize: FontSize.subtitle,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
  },
  recItem: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  recBullet: {
    fontSize: FontSize.body,
    color: Colors.SAFE,
    marginRight: Spacing.sm,
    fontWeight: "800",
  },
  recText: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
  warning: {
    fontSize: FontSize.caption,
    color: Colors.WARNING,
    marginTop: Spacing.sm,
  },
  analyzedAt: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.sm,
  },
  refreshButton: {
    marginTop: Spacing.sm,
  },
});
