// Acil durum hızlı mesaj şablonları — hizalı küçük / büyük dikdörtgenler
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { EMERGENCY_TEMPLATES } from "../constants/rooms";
import { rectChipStyles } from "./rectChipStyles";

interface QuickTemplatesProps {
  onSelect: (text: string) => void;
}

function cardFlex(text: string): number {
  return text.length <= 12 ? 1 : 2;
}

export function QuickTemplates({ onSelect }: QuickTemplatesProps) {
  return (
    <View style={rectChipStyles.row}>
      {EMERGENCY_TEMPLATES.map((text) => (
        <TouchableOpacity
          key={text}
          style={[rectChipStyles.card, { flex: cardFlex(text) }]}
          onPress={() => onSelect(text)}
          activeOpacity={0.7}
        >
          <Text style={rectChipStyles.label} numberOfLines={1} ellipsizeMode="tail">
            {text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
