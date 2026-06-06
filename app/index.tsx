// Uygulama kökü
// Açılışta doğrudan alt navigasyonlu ana ekran (MainTabs) gösterilir.
// Varsayılan sekme Harita olduğu için kullanıcı açılışta konumunu görür.
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { MainTabs } from "./screens/MainTabs";

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <MainTabs />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
});
