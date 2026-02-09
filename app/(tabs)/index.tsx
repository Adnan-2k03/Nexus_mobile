import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import MatchCard from "@/components/MatchCard";
import {
  GAMES,
  REGIONS,
  SKILL_LEVELS,
  MATCH_TYPES,
  Game,
  Region,
  SkillLevel,
  MatchType,
} from "@/lib/game-data";

type FeedTab = "lfg" | "lfo";

function DropdownFilter({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={dropStyles.wrapper}>
      <Text style={dropStyles.label}>{label}</Text>
      <Pressable
        style={dropStyles.button}
        onPress={() => setOpen(true)}
      >
        <Text style={dropStyles.buttonText} numberOfLines={1}>{value}</Text>
        <Ionicons name="chevron-down" size={14} color={Colors.dark.textSecondary} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={dropStyles.overlay} onPress={() => setOpen(false)}>
          <View style={dropStyles.dropdown}>
            <Text style={dropStyles.dropdownTitle}>{label}</Text>
            <ScrollView style={dropStyles.dropdownScroll}>
              {options.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    dropStyles.option,
                    value === opt && dropStyles.optionSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelect(opt);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      dropStyles.optionText,
                      value === opt && dropStyles.optionTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                  {value === opt && (
                    <Ionicons name="checkmark" size={16} color={Colors.dark.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const dropStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: "30%",
  },
  label: {
    color: Colors.dark.text,
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
    marginBottom: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  buttonText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  dropdown: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxHeight: 400,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  dropdownTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
    marginBottom: 12,
  },
  dropdownScroll: {
    maxHeight: 320,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  optionSelected: {
    backgroundColor: Colors.dark.glowCyan,
  },
  optionText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_500Medium",
  },
  optionTextSelected: {
    color: Colors.dark.primary,
  },
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, matches, joinMatch, canClaimDaily, claimDailyReward } = useGame();
  const [activeTab, setActiveTab] = useState<FeedTab>("lfg");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterGame, setFilterGame] = useState("All games");
  const [filterMode, setFilterMode] = useState("All modes");
  const [filterRegion, setFilterRegion] = useState("All regions");
  const [filterRank, setFilterRank] = useState("All ranks");
  const [refreshing, setRefreshing] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const filteredMatches = useMemo(() => {
    let result = matches;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.gamertag.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.gameName.toLowerCase().includes(q),
      );
    }
    if (filterGame !== "All games") {
      result = result.filter((m) => m.gameName === filterGame);
    }
    if (filterMode !== "All modes") {
      result = result.filter((m) => m.gameMode === filterMode);
    }
    if (filterRegion !== "All regions") {
      result = result.filter((m) => m.region === filterRegion);
    }
    if (filterRank !== "All ranks") {
      result = result.filter((m) => m.skillLevel === filterRank);
    }
    return result;
  }, [matches, searchQuery, filterGame, filterMode, filterRegion, filterRank]);

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
      setTimeout(() => setShowReward(false), 2500);
    }
  }, [claimDailyReward]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const gameOptions = ["All games", ...GAMES];
  const modeOptions = ["All modes", ...MATCH_TYPES];
  const regionOptions = ["All regions", ...REGIONS];
  const rankOptions = ["All ranks", ...SKILL_LEVELS];

  const renderHeader = () => (
    <View>
      <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 8 }]}>
        <View style={styles.topLeft}>
          <Ionicons name="radio" size={20} color={Colors.dark.primary} />
          <Text style={styles.pageTitle}>Match Feed</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          {canClaimDaily && (
            <Pressable style={styles.dailyButton} onPress={handleClaimDaily}>
              <Ionicons name="gift" size={16} color={Colors.dark.warning} />
            </Pressable>
          )}
          <View style={styles.coinBadge}>
            <Ionicons name="diamond" size={13} color={Colors.dark.warning} />
            <Text style={styles.coinText}>{user?.coins || 0}</Text>
          </View>
          <Pressable
            style={styles.createButton}
            onPress={() => router.push("/create-match")}
          >
            <Ionicons name="add" size={16} color={Colors.dark.text} />
            <Text style={styles.createText}>Create</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.subtitle}>Discover and apply to match requests</Text>

      {showReward && (
        <View style={styles.rewardBanner}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.dark.success} />
          <Text style={styles.rewardText}>+100 Coins & +25 XP claimed!</Text>
        </View>
      )}

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.dark.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search games, descriptions, or gamer tags..."
            placeholderTextColor={Colors.dark.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={Colors.dark.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilters(!showFilters);
          }}
        >
          <Ionicons name="funnel" size={14} color={showFilters ? Colors.dark.primary : Colors.dark.textSecondary} />
          <Text style={[styles.filterToggleText, showFilters && styles.filterToggleTextActive]}>Filters</Text>
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterRow}>
            <DropdownFilter label="Game" value={filterGame} options={gameOptions} onSelect={setFilterGame} />
            <DropdownFilter label="Mode" value={filterMode} options={modeOptions} onSelect={setFilterMode} />
          </View>
          <View style={styles.filterRow}>
            <DropdownFilter label="Region" value={filterRegion} options={regionOptions} onSelect={setFilterRegion} />
            <DropdownFilter label="Rank" value={filterRank} options={rankOptions} onSelect={setFilterRank} />
          </View>
          <Pressable
            style={styles.clearFilters}
            onPress={() => {
              setFilterGame("All games");
              setFilterMode("All modes");
              setFilterRegion("All regions");
              setFilterRank("All ranks");
            }}
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === "lfg" && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("lfg");
          }}
        >
          <Ionicons
            name="people"
            size={16}
            color={activeTab === "lfg" ? Colors.dark.primary : Colors.dark.textMuted}
          />
          <Text style={[styles.tabText, activeTab === "lfg" && styles.tabTextActive]}>
            LFG (Looking for Group)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "lfo" && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("lfo");
          }}
        >
          <Ionicons
            name="radio-button-on"
            size={14}
            color={activeTab === "lfo" ? Colors.dark.secondary : Colors.dark.textMuted}
          />
          <Text style={[styles.tabText, activeTab === "lfo" && styles.tabTextActiveLfo]}>
            LFO (Looking for Opponent)
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={52} color={Colors.dark.textMuted} />
      <Text style={styles.emptyTitle}>
        No {activeTab === "lfg" ? "LFG" : "LFO"} matches found
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === "lfg"
          ? "Looking for teammates to form a group? Create a match request to find players!"
          : "Looking for an opponent? Create a match request to find challengers!"}
      </Text>
      <Pressable
        style={styles.emptyCreateBtn}
        onPress={() => router.push("/create-match")}
      >
        <Ionicons name="add" size={16} color={Colors.dark.primary} />
        <Text style={styles.emptyCreateText}>
          Create {activeTab === "lfg" ? "LFG" : "LFO"} Request
        </Text>
      </Pressable>
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
    alignItems: "center",
    paddingBottom: 4,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: {
    color: Colors.dark.text,
    fontSize: 22,
    fontFamily: "Rajdhani_700Bold",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.success,
  },
  onlineText: {
    color: Colors.dark.success,
    fontSize: 11,
    fontFamily: "Rajdhani_500Medium",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dailyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 184, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  coinText: {
    color: Colors.dark.warning,
    fontSize: 12,
    fontFamily: "Rajdhani_700Bold",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.dark.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  createText: {
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_400Regular",
    marginBottom: 14,
    marginTop: 2,
  },
  rewardBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.3)",
  },
  rewardText: {
    color: Colors.dark.success,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
    paddingVertical: 10,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  filterToggleActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.glowCyan,
  },
  filterToggleText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
  },
  filterToggleTextActive: {
    color: Colors.dark.primary,
  },
  filtersPanel: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    gap: 10,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  clearFilters: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
    textDecorationLine: "underline" as const,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 14,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: Colors.dark.card,
  },
  tabActive: {
    backgroundColor: Colors.dark.glowCyan,
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
  },
  tabText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
  },
  tabTextActive: {
    color: Colors.dark.primary,
  },
  tabTextActiveLfo: {
    color: Colors.dark.secondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  emptyTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: "Rajdhani_700Bold",
    marginTop: 8,
  },
  emptySubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_400Regular",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  emptyCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.dark.glowCyan,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  emptyCreateText: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontFamily: "Rajdhani_600SemiBold",
  },
});
