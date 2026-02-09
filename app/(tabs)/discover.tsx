import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { Connection, GAMES, Game } from "@/lib/game-data";

interface GamerCardData {
  id: string;
  gamertag: string;
  avatar: string;
  bio: string;
  location: string;
  games: Game[];
  level: number;
  isConnected: boolean;
  isPending: boolean;
}

function GamerCard({
  gamer,
  onConnect,
  onViewProfile,
}: {
  gamer: GamerCardData;
  onConnect: () => void;
  onViewProfile: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.gamerCard, pressed && { opacity: 0.9 }]}
      onPress={onViewProfile}
    >
      <View style={[styles.gamerAvatar, { backgroundColor: gamer.avatar }]}>
        <Text style={styles.gamerAvatarText}>
          {gamer.gamertag.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.gamerNameRow}>
        <Text style={styles.gamerGamertag} numberOfLines={1}>{gamer.gamertag}</Text>
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>Lv.{gamer.level}</Text>
        </View>
      </View>

      {gamer.bio ? (
        <Text style={styles.gamerBio} numberOfLines={2}>{gamer.bio}</Text>
      ) : null}

      {gamer.location ? (
        <View style={styles.gamerLocationRow}>
          <Ionicons name="location-outline" size={12} color={Colors.dark.textMuted} />
          <Text style={styles.gamerLocation}>{gamer.location}</Text>
        </View>
      ) : null}

      <View style={styles.gamerGamesRow}>
        {gamer.games.slice(0, 2).map((g) => (
          <View key={g} style={styles.gameTag}>
            <Text style={styles.gameTagText}>{g}</Text>
          </View>
        ))}
        {gamer.games.length > 2 && (
          <View style={styles.gameTag}>
            <Text style={styles.gameTagText}>+{gamer.games.length - 2}</Text>
          </View>
        )}
      </View>

      {gamer.isConnected ? (
        <View style={styles.connectedBtn}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.dark.success} />
          <Text style={styles.connectedText}>Connected</Text>
        </View>
      ) : gamer.isPending ? (
        <View style={styles.pendingBtn}>
          <Ionicons name="time" size={14} color={Colors.dark.warning} />
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.connectBtn, pressed && { opacity: 0.8 }]}
          onPress={(e) => {
            e.stopPropagation?.();
            onConnect();
          }}
        >
          <Ionicons name="people" size={14} color={Colors.dark.primary} />
          <Text style={styles.connectText}>Connect</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { connections, sendConnectionRequest } = useGame();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterGame, setFilterGame] = useState("All Games");
  const [filterDistance, setFilterDistance] = useState("Global");

  const MOCK_GAMERS: GamerCardData[] = useMemo(() => {
    const gamertags = [
      "ShadowStrike", "NeonBlade", "CyberPh4ntom", "VoidWalker", "PixelReaper",
      "GlitchHunter", "ByteStorm", "NullPointer", "DarkMatter", "QuantumRush",
      "IronPulse", "StealthViper", "RazorEdge", "BlitzKrieg", "MercuryRise",
    ];
    const avatarColors = ["#00F0FF", "#FF00E5", "#7B61FF", "#00FF88", "#FFB800", "#FF3366"];
    const bios = [
      "Competitive Valorant and League player. Looking for skilled teammates.",
      "CS2 grinder, pushing for Global Elite. Let's queue!",
      "Casual gamer, love Apex and Fortnite. Always down to play.",
      "Tournament player, serious about ranked. Diamond+",
      "Just here to vibe and play some games.",
      "FPS main, AWPer in CS2, Jett main in Valo.",
      "Support main looking for a good team.",
      "Grinding ranked, need consistent teammates.",
    ];
    const locations = [
      "San Francisco, CA", "New York, NY", "London, UK", "Tokyo, JP",
      "Seoul, KR", "Berlin, DE", "Sydney, AU", "Toronto, CA",
    ];

    return gamertags.map((gt, i) => ({
      id: `gamer_${i}`,
      gamertag: gt,
      avatar: avatarColors[i % avatarColors.length],
      bio: bios[i % bios.length],
      location: locations[i % locations.length],
      games: [GAMES[i % GAMES.length], GAMES[(i + 3) % GAMES.length]],
      level: Math.floor(Math.random() * 50) + 1,
      isConnected: connections.some((c) => c.userId === `user_${i}` && c.status === "accepted"),
      isPending: connections.some((c) => c.userId === `user_${i}` && c.status === "pending"),
    }));
  }, [connections]);

  const filteredGamers = useMemo(() => {
    let result = MOCK_GAMERS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.gamertag.toLowerCase().includes(q) ||
          g.bio.toLowerCase().includes(q),
      );
    }
    if (filterGame !== "All Games") {
      result = result.filter((g) => g.games.includes(filterGame as Game));
    }
    return result;
  }, [MOCK_GAMERS, searchQuery, filterGame]);

  const handleConnect = (gamer: GamerCardData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendConnectionRequest(gamer.id, gamer.gamertag, gamer.avatar, gamer.games, gamer.level);
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const gameOptions = ["All Games", ...GAMES];
  const distanceOptions = ["Global", "Same Region", "Nearby"];

  const renderHeader = () => (
    <View>
      <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 8 }]}>
        <View style={styles.topLeft}>
          <Ionicons name="people" size={20} color={Colors.dark.primary} />
          <Text style={styles.title}>Discover Gamers</Text>
        </View>
        <Pressable onPress={() => {}} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={18} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Find and connect with gamers worldwide</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.dark.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or gamertag..."
            placeholderTextColor={Colors.dark.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilters(!showFilters);
          }}
        >
          <Ionicons name="funnel" size={14} color={showFilters ? Colors.dark.primary : Colors.dark.textSecondary} />
          <Text style={[styles.filterToggleText, showFilters && { color: Colors.dark.primary }]}>
            Filters
          </Text>
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterPanelTitle}>Filter Gamers</Text>

          <Text style={styles.filterLabel}>Preferred Game</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {gameOptions.map((g) => (
              <Pressable
                key={g}
                style={[styles.filterChip, filterGame === g && styles.filterChipActive]}
                onPress={() => setFilterGame(g)}
              >
                <Text style={[styles.filterChipText, filterGame === g && styles.filterChipTextActive]}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Distance</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {distanceOptions.map((d) => (
              <Pressable
                key={d}
                style={[styles.filterChip, filterDistance === d && styles.filterChipActive]}
                onPress={() => setFilterDistance(d)}
              >
                <Text style={[styles.filterChipText, filterDistance === d && styles.filterChipTextActive]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            style={styles.clearBtn}
            onPress={() => {
              setFilterGame("All Games");
              setFilterDistance("Global");
            }}
          >
            <Text style={styles.clearBtnText}>Clear All Filters</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredGamers}
        renderItem={({ item }) => (
          <GamerCard
            gamer={item}
            onConnect={() => handleConnect(item)}
            onViewProfile={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/player/[id]", params: { id: item.id } });
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) },
        ]}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No gamers found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
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
    alignItems: "center",
    paddingBottom: 4,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 22,
    fontFamily: "Rajdhani_700Bold",
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_400Regular",
    marginBottom: 14,
    marginTop: 2,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
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
  filtersPanel: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  filterPanelTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
    marginBottom: 12,
  },
  filterLabel: {
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
    marginBottom: 6,
    marginTop: 4,
  },
  chipRow: {
    gap: 6,
    marginBottom: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surface,
  },
  filterChipActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.glowCyan,
  },
  filterChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
  },
  filterChipTextActive: {
    color: Colors.dark.primary,
  },
  clearBtn: {
    alignSelf: "flex-end",
    paddingVertical: 6,
  },
  clearBtnText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
    textDecorationLine: "underline" as const,
  },
  gridRow: {
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  gamerCard: {
    flex: 1,
    maxWidth: "48.5%",
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    alignItems: "center",
  },
  gamerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gamerAvatarText: {
    color: "#0A0E1A",
    fontSize: 22,
    fontFamily: "Rajdhani_700Bold",
  },
  gamerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  gamerGamertag: {
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Rajdhani_700Bold",
    flexShrink: 1,
  },
  offlineBadge: {
    backgroundColor: Colors.dark.glowPurple,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  offlineText: {
    color: Colors.dark.tertiary,
    fontSize: 10,
    fontFamily: "Rajdhani_600SemiBold",
  },
  gamerBio: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: "Rajdhani_400Regular",
    textAlign: "center",
    lineHeight: 15,
    marginBottom: 4,
  },
  gamerLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 6,
  },
  gamerLocation: {
    color: Colors.dark.textMuted,
    fontSize: 11,
    fontFamily: "Rajdhani_400Regular",
  },
  gamerGamesRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  gameTag: {
    backgroundColor: Colors.dark.glowCyan,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gameTagText: {
    color: Colors.dark.primary,
    fontSize: 10,
    fontFamily: "Rajdhani_600SemiBold",
  },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.glowCyan,
  },
  connectText: {
    color: Colors.dark.primary,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
  },
  connectedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
  },
  connectedText: {
    color: Colors.dark.success,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
  },
  pendingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 184, 0, 0.1)",
  },
  pendingText: {
    color: Colors.dark.warning,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
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
  },
});
