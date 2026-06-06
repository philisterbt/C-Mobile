// Oda seçici — eşit genişlikte küçük dikdörtgenler
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { ROOM_OPTIONS } from "../constants/rooms";
import { rectChipStyles } from "./rectChipStyles";
import type { RoomId } from "../types/offline";

interface RoomPickerProps {
  activeRoomId: RoomId;
  onChange: (roomId: RoomId) => void;
}

export function RoomPicker({ activeRoomId, onChange }: RoomPickerProps) {
  return (
    <View style={rectChipStyles.row}>
      {ROOM_OPTIONS.map((room) => {
        const active = room.id === activeRoomId;
        return (
          <TouchableOpacity
            key={room.id}
            style={[rectChipStyles.card, styles.card, active && styles.cardActive]}
            onPress={() => onChange(room.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[rectChipStyles.label, active && styles.labelActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {room.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  cardActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  labelActive: {
    color: Colors.SECONDARY,
    fontWeight: "600",
  },
});
