// Ana karşılama ekranı - uygulama ilk açıldığında gösterilir
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { APP_NAME } from "../constants/config";

export default function HomeScreen() {
  // Başla butonuna basıldığında tetiklenir
  const handleStart = () => {
    console.log("Başla'ya basıldı");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Durum çubuğunu açık renkli yap */}
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />

      {/* Merkez içerik alanı */}
      <View style={styles.content}>
        {/* Uygulama adı */}
        <Text style={styles.appName}>{APP_NAME}</Text>

        {/* Açıklama yazısı */}
        <Text style={styles.subtitle}>Güvenli tahliye navigasyonu</Text>
      </View>

      {/* Başla butonu - en altta sabitli */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Başla</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.TEXT_PRIMARY,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  startButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.SECONDARY,
    letterSpacing: 0.5,
  },
});
