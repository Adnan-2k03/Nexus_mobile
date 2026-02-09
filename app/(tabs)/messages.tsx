import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { Conversation } from "@/lib/game-data";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.convItem,
        pressed && styles.convItemPressed,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
          pathname: "/chat/[id]",
          params: { id: conversation.id },
        });
      }}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: conversation.participantAvatar },
        ]}
      >
        <Text style={styles.avatarText}>
          {conversation.participantGamertag.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.convInfo}>
        <View style={styles.convHeader}>
          <Text style={styles.convName} numberOfLines={1}>
            {conversation.participantGamertag}
          </Text>
          <Text style={styles.convTime}>
            {timeAgo(conversation.lastMessageTime)}
          </Text>
        </View>
        <View style={styles.convFooter}>
          <Text style={styles.convMessage} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { conversations, connections } = useGame();

  const pendingCount = useMemo(
    () => connections.filter((c) => c.status === "pending").length,
    [connections],
  );

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const renderHeader = () => (
    <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 8 }]}>
      <Text style={styles.title}>Messages</Text>
      {pendingCount > 0 && (
        <Pressable
          style={styles.requestsButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/connections");
          }}
        >
          <Ionicons name="person-add" size={16} color={Colors.dark.secondary} />
          <Text style={styles.requestsText}>{pendingCount} requests</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={({ item }) => <ConversationItem conversation={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) },
        ]}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color={Colors.dark.textMuted}
            />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Connect with players to start chatting
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 16,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 28,
    fontFamily: "Rajdhani_700Bold",
  },
  requestsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.dark.glowMagenta,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  requestsText: {
    color: Colors.dark.secondary,
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  convItemPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0A0E1A",
    fontSize: 18,
    fontFamily: "Rajdhani_700Bold",
  },
  convInfo: {
    flex: 1,
    gap: 4,
  },
  convHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  convName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: "Rajdhani_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  convTime: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
  },
  convFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  convMessage: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.dark.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#0A0E1A",
    fontSize: 11,
    fontFamily: "Rajdhani_700Bold",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.dark.cardBorder,
    marginLeft: 60,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: "Rajdhani_600SemiBold",
  },
  emptySubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
    textAlign: "center",
  },
});
