// Tek mesaj balonu - gönderilen ve alınan mesajlar için farklı stil
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import { Spacing, FontSize, Radius } from "../constants/theme";
import type { Message, MessageStatus } from "../types/messaging";

interface MessageBubbleProps {
  message: Message;
}

// Mesaj durumu ikonları
const STATUS_ICON: Record<MessageStatus, string> = {
  pending: "⏳",
  sent: "✓",
  failed: "✗",
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOwn = message.isOwn;

  return (
    <View style={[styles.row, isOwn && styles.rowOwn]}>
      {!isOwn && (
        <Text style={styles.senderName}>{message.sender}</Text>
      )}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwn && styles.textOwn]}>{message.text}</Text>
        <View style={styles.meta}>
          <Text style={[styles.time, isOwn && styles.timeOwn]}>
            {formatTime(message.createdAt)}
          </Text>
          {isOwn && (
            <Text style={[styles.status, isOwn && styles.timeOwn]}>
              {" "}{STATUS_ICON[message.status]}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const styles = StyleSheet.create({
  row: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  rowOwn: {
    alignItems: "flex-end",
  },
  senderName: {
    fontSize: FontSize.caption,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 2,
    marginLeft: Spacing.xs,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  bubbleOwn: {
    backgroundColor: Colors.PRIMARY,
    borderBottomRightRadius: Spacing.xs,
  },
  bubbleOther: {
    backgroundColor: Colors.CARD_BG,
    borderBottomLeftRadius: Spacing.xs,
  },
  text: {
    fontSize: FontSize.body,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
  textOwn: {
    color: Colors.SECONDARY,
  },
  meta: {
    flexDirection: "row",
    marginTop: Spacing.xs,
    alignItems: "center",
  },
  time: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
  },
  timeOwn: {
    color: Colors.SECONDARY,
    opacity: 0.85,
  },
  status: {
    fontSize: 11,
  },
});
