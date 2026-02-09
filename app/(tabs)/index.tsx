import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import MatchCard from "@/components/MatchCard";
import FilterChip from "@/components/FilterChip";
import { GAMES, Game } from "@/lib/game-data";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, matches, joinMatch, canClaimDaily, claimDailyReward } =
    useGame();
  const [selectedGame, setSelectedGame] = useState<Game | "All">("All");
  const [refreshing, setRefreshing] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const filteredMatches = useMemo(() => {
    if (selectedGame === "All") return matches;
    return matches.filter((m) => m.gameName === selectedGame);
  }, [matches, selectedGame]);

  const handleJoin = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      joinMatch(id);
    },
    [joinMatch],
  );

  const handleClaimDaily = useCallback(async () => {
    const success = await claimDailyReward();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 2000);
    }
  }, [claimDailyReward]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const renderHeader = () => (
    <View>
      <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 8 }]}>
        <View>
          <Text style={styles.greeting}>
            Welcome back,
          </Text>
          <Text style={styles.gamertag}>{user?.gamertag || "Player"}</Text>
        </View>
        <View style={styles.topRight}>
          {canClaimDaily && (
            <Pressable
              style={styles.dailyButton}
              onPress={handleClaimDaily}
            >
              <Ionicons name="gift" size={18} color={Colors.dark.warning} />
            </Pressable>
          )}
          <View style={styles.coinBadge}>
            <Ionicons name="diamond" size={14} color={Colors.dark.warning} />
            <Text style={styles.coinText}>{user?.coins || 0}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/create-match")}
            style={styles.createButton}
          >
            <Ionicons name="add" size={22} color="#0A0E1A" />
          </Pressable>
        </View>
      </View>

      {showReward && (
        <View style={styles.rewardBanner}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.dark.success} />
          <Text style={styles.rewardText}>+100 Coins & +25 XP claimed!</Text>
        </View>
      )}

      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterChip
            label="All"
            selected={selectedGame === "All"}
            onPress={() => setSelectedGame("All")}
          />
          {GAMES.map((game) => (
            <FilterChip
              key={game}
              label={game}
              selected={selectedGame === game}
              onPress={() => setSelectedGame(game)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.neonDot} />
          <Text style={styles.sectionTitle}>MATCH FEED</Text>
        </View>
        <Text style={styles.matchCount}>
          {filteredMatches.length} active
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="search"
        size={48}
        color={Colors.dark.textMuted}
      />
      <Text style={styles.emptyTitle}>No matches found</Text>
      <Text style={styles.emptySubtitle}>
        Try a different filter or create your own match
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredMatches}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onJoin={handleJoin}
            isOwnMatch={item.userId === user?.id}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) },
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
          />
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
  greeting: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_400Regular",
  },
  gamertag: {
    color: Colors.dark.text,
    fontSize: 24,
    fontFamily: "Rajdhani_700Bold",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dailyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 184, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  coinText: {
    color: Colors.dark.warning,
    fontSize: 13,
    fontFamily: "Rajdhani_700Bold",
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.3)",
  },
  rewardText: {
    color: Colors.dark.success,
    fontSize: 14,
    fontFamily: "Rajdhani_600SemiBold",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterRow: {
    paddingRight: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  neonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.primary,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 1.5,
  },
  matchCount: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
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
