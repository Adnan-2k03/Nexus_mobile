import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { Message } from "@/lib/game-data";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <View
      style={[
        styles.bubbleContainer,
        isOwn ? styles.bubbleRight : styles.bubbleLeft,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther,
          ]}
        >
          {message.text}
        </Text>
      </View>
      <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, conversations, sendMessage } = useGame();
  const [text, setText] = useState("");

  const conversation = useMemo(
    () => conversations.find((c) => c.id === id),
    [conversations, id],
  );

  const reversedMessages = useMemo(
    () => [...(conversation?.messages || [])].reverse(),
    [conversation?.messages],
  );

  const handleSend = useCallback(async () => {
    if (!text.trim() || !id) return;
    const msg = text.trim();
    setText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(id, msg);
  }, [text, id, sendMessage]);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (!conversation) {
    return (
      <View style={styles.container}>
        <View style={[styles.headerBar, { paddingTop: insets.top + webTopInset }]}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={48} color={Colors.dark.textMuted} />
          <Text style={styles.emptyText}>Conversation not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: insets.top + webTopInset }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View
            style={[
              styles.headerAvatar,
              { backgroundColor: conversation.participantAvatar },
            ]}
          >
            <Text style={styles.headerAvatarText}>
              {conversation.participantGamertag.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.headerTitle}>
            {conversation.participantGamertag}
          </Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={reversedMessages}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.senderId === user?.id}
            />
          )}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Start the conversation!
              </Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputBar,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 8) },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={Colors.dark.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[
              styles.sendButton,
              !text.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color={text.trim() ? "#0A0E1A" : Colors.dark.textMuted}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.cardBorder,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    color: "#0A0E1A",
    fontSize: 14,
    fontFamily: "Rajdhani_700Bold",
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 17,
    fontFamily: "Rajdhani_600SemiBold",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleContainer: {
    marginBottom: 8,
    maxWidth: "80%",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
  },
  bubbleRight: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleOwn: {
    backgroundColor: Colors.dark.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.dark.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: "Rajdhani_500Medium",
    lineHeight: 20,
  },
  bubbleTextOwn: {
    color: "#0A0E1A",
  },
  bubbleTextOther: {
    color: Colors.dark.text,
  },
  timeText: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    fontFamily: "Rajdhani_400Regular",
    marginTop: 2,
    marginHorizontal: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    backgroundColor: Colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.cardBorder,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Rajdhani_500Medium",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.dark.card,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
    fontFamily: "Rajdhani_500Medium",
  },
  emptyChat: {
    alignItems: "center",
    paddingVertical: 40,
    transform: [{ scaleY: -1 }],
  },
  emptyChatText: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
  },
});
