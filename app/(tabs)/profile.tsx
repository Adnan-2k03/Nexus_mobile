import React, { useState } from "react";
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
  const { user, connections, matches, canClaimDaily, claimDailyReward } = useGame();
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  if (!user) return null;

  const progress = xpProgress(user.xp);
  const nextLevelXp = xpForNextLevel(user.level);
  const currentXpInLevel = user.xp % 100;

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

  const handleDailyClaim = async () => {
    const success = await claimDailyReward();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 2500);
    }
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
        <Text style={styles.pageTitle}>My Profile</Text>
        <Pressable onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: user.avatar }]}>
            <Text style={styles.avatarText}>
              {user.gamertag.charAt(0).toUpperCase()}
            </Text>
            <Pressable style={styles.cameraIcon}>
              <Ionicons name="camera" size={12} color={Colors.dark.text} />
            </Pressable>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{user.gamertag}</Text>
            <Text style={styles.gamertagHandle}>@{user.gamertag}</Text>
            {user.bio ? (
              <Text style={styles.bio} numberOfLines={3}>{user.bio}</Text>
            ) : null}
            <View style={styles.metaRow}>
              {user.location ? (
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={12} color={Colors.dark.textMuted} />
                  <Text style={styles.metaText}>{user.location || "Unknown"}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.profileActions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/edit-profile");
            }}
          >
            <Ionicons name="create-outline" size={14} color={Colors.dark.text} />
            <Text style={styles.actionBtnText}>Edit Profile</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="add" size={14} color={Colors.dark.text} />
            <Text style={styles.actionBtnText}>Add Game</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="grid" size={16} color={Colors.dark.primary} />
          <Text style={styles.sectionTitle}>Rewards & Progress</Text>
        </View>

        <View style={styles.rewardsRow}>
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <Ionicons name="trending-up" size={16} color={Colors.dark.primary} />
              <Text style={styles.levelTitle}>Level {user.level}</Text>
            </View>
            <View style={styles.xpBarSection}>
              <View style={styles.xpLabels}>
                <Text style={styles.xpLabel}>{currentXpInLevel} XP</Text>
                <Text style={styles.xpLabel}>{nextLevelXp} XP</Text>
              </View>
              <View style={styles.xpBar}>
                <View style={[styles.xpFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.xpToNext}>
                {nextLevelXp - currentXpInLevel} XP to Level {user.level + 1}
              </Text>
            </View>
          </View>

          <View style={styles.rewardsTasksCard}>
            <View style={styles.levelHeader}>
              <Ionicons name="grid" size={16} color={Colors.dark.warning} />
              <Text style={styles.levelTitle}>Rewards & Tasks</Text>
            </View>

            {canClaimDaily ? (
              <Pressable
                style={({ pressed }) => [styles.dailyCheckIn, pressed && { opacity: 0.8 }]}
                onPress={handleDailyClaim}
              >
                <Ionicons name="gift" size={14} color={Colors.dark.warning} />
                <Text style={styles.dailyText}>Daily Check-in</Text>
              </Pressable>
            ) : (
              <View style={styles.dailyDone}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.dark.success} />
                <Text style={styles.dailyDoneText}>Claimed today</Text>
              </View>
            )}

            {showReward && (
              <Text style={styles.rewardClaimedText}>+100 Coins!</Text>
            )}

            <Text style={styles.noTasks}>
              {user.coins} coins available
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="gamepad-variant" size={16} color={Colors.dark.primary} />
          <Text style={styles.sectionTitle}>
            Gaming Profiles ({user.preferredGames.length})
          </Text>
        </View>

        {user.preferredGames.length > 0 ? (
          user.preferredGames.map((game) => {
            const isExpanded = expandedGame === game;
            const rank = user.skillLevels[game] || "Unranked";

            return (
              <View key={game}>
                <Pressable
                  style={styles.gameProfileItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedGame(isExpanded ? null : game);
                  }}
                >
                  <View style={styles.gameProfileLeft}>
                    <MaterialCommunityIcons
                      name="gamepad-variant"
                      size={18}
                      color={Colors.dark.primary}
                    />
                    <Text style={styles.gameProfileName}>{game}</Text>
                    <View
                      style={[
                        styles.rankBadge,
                        { backgroundColor: `${getSkillColor(rank)}20` },
                      ]}
                    >
                      <Text style={[styles.rankBadgeText, { color: getSkillColor(rank) }]}>
                        {rank}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={Colors.dark.textMuted}
                    />
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.expandedStats}>
                    <View style={[styles.statBox, { borderColor: Colors.dark.primary }]}>
                      <View style={styles.statHeader}>
                        <Ionicons name="star-outline" size={12} color={Colors.dark.primary} />
                        <Text style={[styles.statHeaderText, { color: Colors.dark.primary }]}>
                          Current Rank
                        </Text>
                      </View>
                      <Text style={styles.statValue}>{rank}</Text>
                    </View>
                    <View style={[styles.statBox, { borderColor: Colors.dark.error }]}>
                      <View style={styles.statHeader}>
                        <Ionicons name="trophy" size={12} color={Colors.dark.error} />
                        <Text style={[styles.statHeaderText, { color: Colors.dark.error }]}>
                          Highest Rank
                        </Text>
                      </View>
                      <Text style={styles.statValue}>{rank}</Text>
                    </View>
                    <View style={[styles.statBox, { borderColor: Colors.dark.tertiary }]}>
                      <View style={styles.statHeader}>
                        <Ionicons name="time" size={12} color={Colors.dark.tertiary} />
                        <Text style={[styles.statHeaderText, { color: Colors.dark.tertiary }]}>
                          Hours Played
                        </Text>
                      </View>
                      <Text style={styles.statValue}>
                        {Math.floor(Math.random() * 500) + 50}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.noGames}>No games added yet. Tap "Add Game" above.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="link" size={16} color={Colors.dark.tertiary} />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/connections");
          }}
        >
          <Ionicons name="people-outline" size={18} color={Colors.dark.primary} />
          <Text style={styles.quickActionText}>View Connections</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.dark.textMuted} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/create-match");
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.dark.secondary} />
          <Text style={styles.quickActionText}>Create Match</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.dark.textMuted} />
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
    marginBottom: 16,
  },
  pageTitle: {
    color: Colors.dark.text,
    fontSize: 22,
    fontFamily: "Rajdhani_700Bold",
  },
  profileCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0A0E1A",
    fontSize: 24,
    fontFamily: "Rajdhani_700Bold",
  },
  cameraIcon: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.dark.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    color: Colors.dark.text,
    fontSize: 20,
    fontFamily: "Rajdhani_700Bold",
  },
  gamertagHandle: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
    marginBottom: 4,
  },
  bio: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
    lineHeight: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
  },
  profileActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  actionBtnText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
  },
  sectionCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
  },
  rewardsRow: {
    flexDirection: "row",
    gap: 10,
  },
  levelCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  levelTitle: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: "Rajdhani_700Bold",
  },
  xpBarSection: {
    gap: 4,
  },
  xpLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpLabel: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    fontFamily: "Rajdhani_400Regular",
  },
  xpBar: {
    height: 5,
    backgroundColor: Colors.dark.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 3,
  },
  xpToNext: {
    color: Colors.dark.textMuted,
    fontSize: 10,
    fontFamily: "Rajdhani_400Regular",
    textAlign: "center",
  },
  rewardsTasksCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  dailyCheckIn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 184, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  dailyText: {
    color: Colors.dark.warning,
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
  },
  dailyDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  dailyDoneText: {
    color: Colors.dark.success,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
  },
  rewardClaimedText: {
    color: Colors.dark.success,
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
    marginBottom: 4,
  },
  noTasks: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    fontFamily: "Rajdhani_400Regular",
    fontStyle: "italic" as const,
  },
  gameProfileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.cardBorder,
  },
  gameProfileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  gameProfileName: {
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Rajdhani_600SemiBold",
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankBadgeText: {
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
  },
  expandedStats: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 2,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  statHeaderText: {
    fontSize: 10,
    fontFamily: "Rajdhani_600SemiBold",
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
  },
  noGames: {
    color: Colors.dark.textMuted,
    fontSize: 13,
    fontFamily: "Rajdhani_400Regular",
    textAlign: "center",
    paddingVertical: 16,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.cardBorder,
  },
  quickActionText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: "Rajdhani_500Medium",
    flex: 1,
  },
});
