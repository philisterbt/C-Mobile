// Mesajlar sekmesi - tek sohbet ekranı
import React from "react";
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
import { CHAT_TITLE } from "../../constants/rooms";
import { Header } from "../../components/Header";
import { MessageBubble } from "../../components/MessageBubble";
import { ChatInput } from "../../components/ChatInput";
import { OfflineBanner } from "../../components/OfflineBanner";
import { useOfflineMessages } from "../../hooks/useOfflineMessages";

export function MessagesScreen() {
  const {
    messages,
    loading,
    pendingCount,
    isConnected,
    refresh,
    sendMessage,
    sync,
  } = useOfflineMessages();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      <Header title={CHAT_TITLE} />
      <OfflineBanner pendingCount={pendingCount} isConnected={isConnected} />

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

      <ChatInput onSend={sendMessage} />
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
