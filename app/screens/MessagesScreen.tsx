// Mesajlar sekmesi - P2P yakın mesajlaşma + offline sync
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/theme";
import { getRoomLabel } from "../../constants/rooms";
import { Header } from "../../components/Header";
import { MessageBubble } from "../../components/MessageBubble";
import { ChatInput } from "../../components/ChatInput";
import { OfflineBanner } from "../../components/OfflineBanner";
import { RoomPicker } from "../../components/RoomPicker";
import { NearbyPeersPanel } from "../../components/NearbyPeersPanel";
import { QuickTemplates } from "../../components/QuickTemplates";
import { useOfflineMessages } from "../../hooks/useOfflineMessages";
import { useP2PMessaging } from "../../hooks/useP2PMessaging";

export function MessagesScreen() {
  const [peersExpanded, setPeersExpanded] = useState(false);

  const {
    messages,
    loading,
    pendingCount,
    isConnected,
    roomId,
    setRoomId,
    refresh,
    sendMessage,
    sync,
    relayPending,
  } = useOfflineMessages();

  const onP2PUpdate = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const { peers, connectedCount, isNearbyActive } = useP2PMessaging(onP2PUpdate);

  useEffect(() => {
    if (connectedCount > 0) {
      relayPending();
    }
  }, [connectedCount, relayPending]);

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      <Header title={`Mesajlar · ${getRoomLabel(roomId)}`} />

      <OfflineBanner
        pendingCount={pendingCount}
        isConnected={isConnected}
        p2pActive={isNearbyActive}
        connectedPeerCount={connectedCount}
      />

      <RoomPicker activeRoomId={roomId} onChange={setRoomId} />

      <NearbyPeersPanel
        peers={peers}
        connectedCount={connectedCount}
        expanded={peersExpanded}
        onToggle={() => setPeersExpanded((v) => !v)}
      />

      {loading && messages.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.PRIMARY} size="large" />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={async () => {
                if (isConnected) await sync();
                await refresh();
              }}
              tintColor={Colors.PRIMARY}
              colors={[Colors.PRIMARY]}
            />
          }
          renderItem={({ item }) => <MessageBubble message={item} />}
        />
      )}

      <QuickTemplates onSelect={handleSend} />
      <ChatInput onSend={handleSend} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: Spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
