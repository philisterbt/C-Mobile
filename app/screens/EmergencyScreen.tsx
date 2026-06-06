// Acil eylemler ekranı - 112 arama, fener, konum paylaşımı ve offline acil ipuçları
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Colors } from "../../constants/colors";
import { Spacing, FontSize, Radius } from "../../constants/theme";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { useLocation } from "../../hooks/useLocation";
import { getEmergencyTips } from "../../services/offlineMapService";

interface EmergencyScreenProps {
  // Geri butonu - yalnızca sekme dışı kullanımda verilir
  onBack?: () => void;
}

export function EmergencyScreen({ onBack }: EmergencyScreenProps) {
  const { location, isDefault } = useLocation();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [tips, setTips] = useState<string[]>([]);

  // Offline bundle'dan kaydedilmiş acil ipuçlarını yükle (internet gerektirmez)
  useEffect(() => {
    getEmergencyTips().then(setTips);
  }, []);

  // 112 acil çağrı - yanlışlıkla aramayı önlemek için önce onay sorulur
  const handleCall = useCallback(() => {
    Alert.alert("Acil Çağrı", "112 Acil Çağrı Merkezi aranacak. Onaylıyor musun?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Ara",
        style: "destructive",
        onPress: () => Linking.openURL("tel:112"),
      },
    ]);
  }, []);

  // El fenerini aç/kapat - kamera izni gerekir
  const handleTorch = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "İzin Gerekli",
          "Feneri kullanmak için kamera iznine ihtiyaç var."
        );
        return;
      }
    }
    setTorchOn((prev) => !prev);
  }, [permission, requestPermission]);

  // Konumu sistem paylaşım menüsü ile paylaş
  const handleShareLocation = useCallback(async () => {
    const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    try {
      await Share.share({
        message: `Acil durum! Konumum: ${mapsUrl}`,
      });
    } catch {
      Alert.alert("Hata", "Konum paylaşılamadı.");
    }
  }, [location]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      <Header title="Acil Eylemler" onBack={onBack} />

      {/* Fener için arka planda gizli kamera (sadece torch açıkken) */}
      {torchOn && Platform.OS !== "web" && (
        <CameraView style={styles.hiddenCamera} enableTorch />
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 112 Acil Çağrı - en belirgin buton */}
        <TouchableOpacity
          style={[styles.actionCard, styles.callCard]}
          onPress={handleCall}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.callTitle}>112 ARA</Text>
          <Text style={styles.callSubtitle}>Acil Çağrı Merkezi</Text>
        </TouchableOpacity>

        {/* Fener */}
        <TouchableOpacity
          style={[styles.actionCard, torchOn && styles.actionCardActive]}
          onPress={handleTorch}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>🔦</Text>
          <Text style={styles.actionTitle}>
            {torchOn ? "Feneri Kapat" : "Feneri Aç"}
          </Text>
          <Text style={styles.actionSubtitle}>
            Karanlıkta sinyal vermek için
          </Text>
        </TouchableOpacity>

        {/* Konum Paylaş */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleShareLocation}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionTitle}>Konumumu Paylaş</Text>
          <Text style={styles.actionSubtitle}>
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            {isDefault ? " (varsayılan)" : ""}
          </Text>
        </TouchableOpacity>

        {/* Offline acil ipuçları - harita paketi indirildiyse görünür */}
        {tips.length > 0 && (
          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Acil Durum İpuçları</Text>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </Card>
        )}
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
  // Kamera görünmez olmalı ama torch'un çalışması için mount edilmeli
  hiddenCamera: {
    position: "absolute",
    width: 1,
    height: 1,
    top: -10,
    left: -10,
  },
  actionCard: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  actionCardActive: {
    borderWidth: 2,
    borderColor: Colors.WARNING,
  },
  callCard: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: Spacing.xl,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  callTitle: {
    fontSize: FontSize.heading,
    fontWeight: "800",
    color: Colors.SECONDARY,
    letterSpacing: 1,
  },
  callSubtitle: {
    fontSize: FontSize.body,
    color: Colors.SECONDARY,
    marginTop: Spacing.xs,
    opacity: 0.9,
  },
  actionTitle: {
    fontSize: FontSize.subtitle,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
  },
  actionSubtitle: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  tipsCard: {
    marginTop: Spacing.sm,
  },
  tipsTitle: {
    fontSize: FontSize.subtitle,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  tipBullet: {
    color: Colors.WARNING,
    marginRight: Spacing.sm,
    fontWeight: "800",
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
});
