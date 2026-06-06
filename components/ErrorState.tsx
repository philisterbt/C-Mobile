// Hata durumu bileşeni - hata mesajı ve yeniden deneme butonu gösterir
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Spacing, FontSize } from "../constants/theme";
import { PrimaryButton } from "./PrimaryButton";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton
        label="Tekrar Dene"
        onPress={onRetry}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: FontSize.body,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  button: {
    minWidth: 180,
  },
});
