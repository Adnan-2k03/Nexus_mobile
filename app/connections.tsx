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
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { Connection } from "@/lib/game-data";

function ConnectionItem({
  connection,
  onAccept,
  onReject,
}: {
  connection: Connection;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const isPending = connection.status === "pending";

  return (
    <View style={styles.item}>
      <View
        style={[styles.avatar, { backgroundColor: connection.avatar }]}
      >
        <Text style={styles.avatarText}>
          {connection.gamertag.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.gamertag}>{connection.gamertag}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{connection.level}</Text>
          </View>
        </View>
        <Text style={styles.gamesText} numberOfLines={1}>
          {connection.games.join(", ")}
        </Text>
      </View>
      {isPending ? (
        <View style={styles.actions}>
          <Pressable
            style={styles.acceptBtn}
            onPress={() => onAccept(connection.id)}
          >
            <Ionicons name="checkmark" size={18} color="#0A0E1A" />
          </Pressable>
          <Pressable
            style={styles.rejectBtn}
            onPress={() => onReject(connection.id)}
          >
            <Ionicons name="close" size={18} color={Colors.dark.error} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.connectedBadge}>
          <Ionicons name="link" size={14} color={Colors.dark.success} />
        </View>
      )}
    </View>
  );
}

export default function ConnectionsScreen() {
  const insets = useSafeAreaInsets();
  const { connections, acceptConnection, rejectConnection } = useGame();

  const pending = useMemo(
    () => connections.filter((c) => c.status === "pending"),
    [connections],
  );
  const accepted = useMemo(
    () => connections.filter((c) => c.status === "accepted"),
    [connections],
  );

  const handleAccept = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    acceptConnection(id);
  };

  const handleReject = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rejectConnection(id);
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const allConnections = [...pending, ...accepted];

  return (
    <View style={styles.container}>
      <FlatList
        data={allConnections}
        renderItem={({ item }) => (
          <ConnectionItem
            connection={item}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 40 + (Platform.OS === "web" ? 34 : 0) },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + webTopInset }]}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
            </Pressable>
            <Text style={styles.title}>Connections</Text>
            <View style={{ width: 22 }} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={48}
              color={Colors.dark.textMuted}
            />
            <Text style={styles.emptyTitle}>No connections yet</Text>
            <Text style={styles.emptySubtitle}>
              Join matches to connect with other players
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 20,
    fontFamily: "Rajdhani_700Bold",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0A0E1A",
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gamertag: {
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Rajdhani_600SemiBold",
  },
  levelBadge: {
    backgroundColor: Colors.dark.glowPurple,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  levelText: {
    color: Colors.dark.tertiary,
    fontSize: 11,
    fontFamily: "Rajdhani_600SemiBold",
  },
  gamesText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.dark.success,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.dark.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.error,
  },
  connectedBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
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
