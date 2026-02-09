import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { GAMES, Game } from "@/lib/game-data";

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

const MOCK_RANKS = ["Gold", "Platinum", "Diamond", "Master", "Silver", "Grandmaster"];

export default function PlayerProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { connections, sendConnectionRequest } = useGame();
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const gamertags = [
    "ShadowStrike", "NeonBlade", "CyberPh4ntom", "VoidWalker", "PixelReaper",
    "GlitchHunter", "ByteStorm", "NullPointer", "DarkMatter", "QuantumRush",
    "IronPulse", "StealthViper", "RazorEdge", "BlitzKrieg", "MercuryRise",
  ];
  const avatarColors = ["#00F0FF", "#FF00E5", "#7B61FF", "#00FF88", "#FFB800", "#FF3366"];
  const bios = [
    "Competitive Valorant and League player. Looking for skilled teammates for tournaments. Currently grinding Diamond rank. Open for scrimmages and practice sessions!",
    "CS2 grinder, pushing for Global Elite. Let's queue!",
    "Casual gamer, love Apex and Fortnite. Always down to play.",
    "Tournament player, serious about ranked. Diamond+ only.",
    "Just here to vibe and play some games with chill people.",
  ];
  const locations = [
    "San Francisco, CA", "New York, NY", "London, UK", "Tokyo, JP",
    "Seoul, KR", "Berlin, DE", "Sydney, AU", "Toronto, CA",
  ];

  const idx = parseInt(id?.replace("gamer_", "") || "0", 10);
  const gamertag = gamertags[idx % gamertags.length];
  const avatar = avatarColors[idx % avatarColors.length];
  const bio = bios[idx % bios.length];
  const location = locations[idx % locations.length];
  const playerGames = [GAMES[idx % GAMES.length], GAMES[(idx + 3) % GAMES.length], GAMES[(idx + 5) % GAMES.length]];
  const level = (idx * 7 + 5) % 50 + 1;

  const connection = connections.find((c) => c.userId === id);
  const isConnected = connection?.status === "accepted";
  const isPending = connection?.status === "pending";

  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendConnectionRequest(id || "", gamertag, avatar, playerGames, level);
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: insets.top + webTopInset }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Player Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: avatar }]}>
              <Text style={styles.avatarText}>
                {gamertag.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{gamertag}</Text>
              <Text style={styles.gamertagHandle}>@{gamertag}</Text>
              <Text style={styles.bio}>{bio}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={12} color={Colors.dark.textMuted} />
                  <Text style={styles.metaText}>{location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={12} color={Colors.dark.warning} />
                  <Text style={styles.metaText}>Level {level}</Text>
                </View>
              </View>
            </View>
          </View>

          {isConnected ? (
            <View style={styles.connectedBtn}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.dark.success} />
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          ) : isPending ? (
            <View style={styles.pendingBtn}>
              <Ionicons name="time" size={16} color={Colors.dark.warning} />
              <Text style={styles.pendingText}>Request Pending</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.connectActionBtn, pressed && { opacity: 0.8 }]}
              onPress={handleConnect}
            >
              <Ionicons name="people" size={16} color={Colors.dark.primary} />
              <Text style={styles.connectActionText}>Connect</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="grid" size={16} color={Colors.dark.primary} />
            <Text style={styles.sectionTitle}>Rewards & Progress</Text>
          </View>
          <View style={styles.rewardsRow}>
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Ionicons name="trending-up" size={14} color={Colors.dark.primary} />
                <Text style={styles.levelTitle}>Level {level}</Text>
              </View>
              <View style={styles.xpBarSection}>
                <View style={styles.xpLabels}>
                  <Text style={styles.xpLabel}>0 XP</Text>
                  <Text style={styles.xpLabel}>100 XP</Text>
                </View>
                <View style={styles.xpBar}>
                  <View style={[styles.xpFill, { width: `${((level * 37) % 100)}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="gamepad-variant" size={16} color={Colors.dark.primary} />
            <Text style={styles.sectionTitle}>
              Gaming Profiles ({playerGames.length})
            </Text>
          </View>

          {playerGames.map((game, gi) => {
            const isExpanded = expandedGame === game;
            const rank = MOCK_RANKS[(idx + gi) % MOCK_RANKS.length];

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
                      size={16}
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
                        <Ionicons name="star-outline" size={11} color={Colors.dark.primary} />
                        <Text style={[styles.statHeaderText, { color: Colors.dark.primary }]}>
                          Current Rank
                        </Text>
                      </View>
                      <Text style={styles.statValue}>{rank}</Text>
                    </View>
                    <View style={[styles.statBox, { borderColor: Colors.dark.error }]}>
                      <View style={styles.statHeader}>
                        <Ionicons name="trophy" size={11} color={Colors.dark.error} />
                        <Text style={[styles.statHeaderText, { color: Colors.dark.error }]}>
                          Highest Rank
                        </Text>
                      </View>
                      <Text style={styles.statValue}>{rank}</Text>
                    </View>
                    <View style={[styles.statBox, { borderColor: Colors.dark.tertiary }]}>
                      <View style={styles.statHeader}>
                        <Ionicons name="time" size={11} color={Colors.dark.tertiary} />
                        <Text style={[styles.statHeaderText, { color: Colors.dark.tertiary }]}>
                          Hours Played
                        </Text>
                      </View>
                      <Text style={styles.statValue}>
                        {(idx * 47 + gi * 113) % 500 + 50}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 17,
    fontFamily: "Rajdhani_700Bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  connectActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.glowCyan,
  },
  connectActionText: {
    color: Colors.dark.primary,
    fontSize: 15,
    fontFamily: "Rajdhani_600SemiBold",
  },
  connectedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
  },
  connectedText: {
    color: Colors.dark.success,
    fontSize: 15,
    fontFamily: "Rajdhani_600SemiBold",
  },
  pendingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 184, 0, 0.1)",
  },
  pendingText: {
    color: Colors.dark.warning,
    fontSize: 15,
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
    gap: 10,
  },
  levelCard: {
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
});
