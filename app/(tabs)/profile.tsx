import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { xpProgress, xpForNextLevel } from "@/lib/game-data";

function getSkillColor(skill: string): string {
  const colors: Record<string, string> = {
    Bronze: "#CD7F32",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
    Platinum: "#00CED1",
    Diamond: "#B9F2FF",
    Master: Colors.dark.secondary,
    Grandmaster: Colors.dark.tertiary,
    Radiant: Colors.dark.primary,
  };
  return colors[skill] || Colors.dark.textSecondary;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, connections, matches } = useGame();

  if (!user) return null;

  const progress = xpProgress(user.xp);
  const nextLevelXp = xpForNextLevel(user.level);
  const currentXpInLevel = user.xp % 100;
  const acceptedConnections = connections.filter(
    (c) => c.status === "accepted",
  ).length;
  const myMatches = matches.filter((m) => m.userId === user.id).length;

  const handleLogout = () => {
    Alert.alert("Reset Profile", "This will clear all your data. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + webTopInset + 8,
          paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Pressable onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: user.avatar }]}>
          <Text style={styles.avatarText}>
            {user.gamertag.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.gamertag}>{user.gamertag}</Text>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={12} color={Colors.dark.warning} />
            <Text style={styles.levelText}>Level {user.level}</Text>
          </View>
        </View>

        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>
              XP: {currentXpInLevel}/{nextLevelXp}
            </Text>
            <Text style={styles.xpTotal}>{user.xp} total</Text>
          </View>
          <View style={styles.xpBar}>
            <View
              style={[styles.xpFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="diamond" size={22} color={Colors.dark.warning} />
          <Text style={styles.statValue}>{user.coins}</Text>
          <Text style={styles.statLabel}>Coins</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={22} color={Colors.dark.primary} />
          <Text style={styles.statValue}>{acceptedConnections}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="game-controller" size={22} color={Colors.dark.secondary} />
          <Text style={styles.statValue}>{myMatches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.neonDot, { backgroundColor: Colors.dark.primary }]} />
          <Text style={styles.sectionTitle}>GAMES & RANKS</Text>
        </View>
        {user.preferredGames.length > 0 ? (
          user.preferredGames.map((game) => (
            <View key={game} style={styles.gameItem}>
              <MaterialCommunityIcons
                name="gamepad-variant"
                size={18}
                color={Colors.dark.primary}
              />
              <Text style={styles.gameItemName}>{game}</Text>
              {user.skillLevels[game] && (
                <View
                  style={[
                    styles.skillBadge,
                    {
                      backgroundColor: `${getSkillColor(user.skillLevels[game])}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.skillBadgeText,
                      { color: getSkillColor(user.skillLevels[game]) },
                    ]}
                  >
                    {user.skillLevels[game]}
                  </Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noGamesText}>No games selected</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.neonDot, { backgroundColor: Colors.dark.tertiary }]} />
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.actionItem, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/connections");
          }}
        >
          <Ionicons name="people-outline" size={20} color={Colors.dark.primary} />
          <Text style={styles.actionText}>View Connections</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionItem, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/create-match");
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.dark.secondary} />
          <Text style={styles.actionText}>Create Match</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 28,
    fontFamily: "Rajdhani_700Bold",
  },
  profileCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#0A0E1A",
    fontSize: 28,
    fontFamily: "Rajdhani_700Bold",
  },
  gamertag: {
    color: Colors.dark.text,
    fontSize: 24,
    fontFamily: "Rajdhani_700Bold",
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 184, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelText: {
    color: Colors.dark.warning,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
  },
  bio: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  xpSection: {
    width: "100%",
    gap: 6,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
  },
  xpTotal: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
  },
  xpBar: {
    height: 6,
    backgroundColor: Colors.dark.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: 20,
    fontFamily: "Rajdhani_700Bold",
  },
  statLabel: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    fontFamily: "Rajdhani_500Medium",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  neonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 1.5,
  },
  gameItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.dark.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  gameItemName: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: "Rajdhani_500Medium",
    flex: 1,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  skillBadgeText: {
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
  },
  noGamesText: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.dark.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  actionText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: "Rajdhani_500Medium",
    flex: 1,
  },
});
