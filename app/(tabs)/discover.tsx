import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ScrollView,
  Modal,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import TournamentCard from "@/components/TournamentCard";
import FilterChip from "@/components/FilterChip";
import { Tournament } from "@/lib/game-data";

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { tournaments, user, spendCoins } = useGame();
  const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "completed">("all");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return tournaments;
    return tournaments.filter((t) => t.status === filter);
  }, [tournaments, filter]);

  const handleRegister = async (tournament: Tournament) => {
    const success = await spendCoins(tournament.entryFee);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedTournament(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const renderHeader = () => (
    <View>
      <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 8 }]}>
        <View>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Tournaments & Events</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(["all", "upcoming", "live", "completed"] as const).map((f) => (
          <FilterChip
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.neonDot, { backgroundColor: Colors.dark.secondary }]} />
          <Text style={styles.sectionTitle}>TOURNAMENTS</Text>
        </View>
        <Text style={styles.countText}>{filtered.length} events</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <TournamentCard
            tournament={item}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTournament(item);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) },
        ]}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No tournaments found</Text>
          </View>
        }
      />

      <Modal
        visible={!!selectedTournament}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedTournament(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle} />
            {selectedTournament && (
              <>
                <Pressable
                  style={styles.modalClose}
                  onPress={() => setSelectedTournament(null)}
                >
                  <Ionicons name="close" size={22} color={Colors.dark.textSecondary} />
                </Pressable>

                <Text style={styles.modalTitle}>{selectedTournament.name}</Text>
                <View style={styles.modalGameRow}>
                  <Ionicons name="game-controller" size={16} color={Colors.dark.primary} />
                  <Text style={styles.modalGameText}>{selectedTournament.gameName}</Text>
                </View>

                <Text style={styles.modalDescription}>
                  {selectedTournament.description}
                </Text>

                <View style={styles.modalDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="trophy" size={18} color={Colors.dark.warning} />
                    <Text style={styles.detailLabel}>Prize Pool</Text>
                    <Text style={styles.detailValue}>{selectedTournament.prizePool}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="ticket" size={18} color={Colors.dark.secondary} />
                    <Text style={styles.detailLabel}>Entry Fee</Text>
                    <Text style={styles.detailValue}>{selectedTournament.entryFee} Coins</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="people" size={18} color={Colors.dark.tertiary} />
                    <Text style={styles.detailLabel}>Teams</Text>
                    <Text style={styles.detailValue}>
                      {selectedTournament.registeredTeams}/{selectedTournament.maxTeams}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="grid" size={18} color={Colors.dark.primary} />
                    <Text style={styles.detailLabel}>Format</Text>
                    <Text style={styles.detailValue}>{selectedTournament.format}</Text>
                  </View>
                </View>

                {selectedTournament.status === "upcoming" && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.registerButton,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => handleRegister(selectedTournament)}
                  >
                    <Ionicons name="flash" size={18} color="#0A0E1A" />
                    <Text style={styles.registerText}>
                      Register ({selectedTournament.entryFee} Coins)
                    </Text>
                  </Pressable>
                )}
                {selectedTournament.status === "live" && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Tournament is live</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 16,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 28,
    fontFamily: "Rajdhani_700Bold",
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
  },
  filterRow: {
    marginBottom: 16,
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
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 1.5,
  },
  countText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.cardBorder,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalClose: {
    position: "absolute" as const,
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    color: Colors.dark.text,
    fontSize: 24,
    fontFamily: "Rajdhani_700Bold",
    marginBottom: 6,
  },
  modalGameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  modalGameText: {
    color: Colors.dark.primary,
    fontSize: 15,
    fontFamily: "Rajdhani_600SemiBold",
  },
  modalDescription: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalDetails: {
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_500Medium",
    flex: 1,
  },
  detailValue: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: "Rajdhani_600SemiBold",
  },
  registerButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  registerText: {
    color: "#0A0E1A",
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.dark.glowMagenta,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.error,
  },
  liveText: {
    color: Colors.dark.error,
    fontSize: 15,
    fontFamily: "Rajdhani_600SemiBold",
  },
});
