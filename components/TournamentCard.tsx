import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Tournament } from "@/lib/game-data";

interface TournamentCardProps {
  tournament: Tournament;
  onPress: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusStyle(status: string) {
  switch (status) {
    case "live":
      return { bg: Colors.dark.glowMagenta, color: Colors.dark.error, label: "LIVE" };
    case "upcoming":
      return { bg: Colors.dark.glowCyan, color: Colors.dark.primary, label: "UPCOMING" };
    case "completed":
      return { bg: "rgba(74, 85, 104, 0.3)", color: Colors.dark.textMuted, label: "COMPLETED" };
    default:
      return { bg: Colors.dark.glowCyan, color: Colors.dark.primary, label: status.toUpperCase() };
  }
}

export default function TournamentCard({ tournament, onPress }: TournamentCardProps) {
  const statusStyle = getStatusStyle(tournament.status);
  const spotsLeft = tournament.maxTeams - tournament.registeredTeams;
  const fillPercent = (tournament.registeredTeams / tournament.maxTeams) * 100;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{tournament.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            {tournament.status === "live" && (
              <View style={styles.liveDot} />
            )}
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
        <View style={styles.gameRow}>
          <MaterialCommunityIcons name="gamepad-variant" size={14} color={Colors.dark.primary} />
          <Text style={styles.gameText}>{tournament.gameName}</Text>
          <Text style={styles.formatText}>{tournament.format}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="trophy" size={16} color={Colors.dark.warning} />
          <Text style={styles.infoValue}>{tournament.prizePool}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="ticket" size={16} color={Colors.dark.secondary} />
          <Text style={styles.infoValue}>{tournament.entryFee} Coins</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={16} color={Colors.dark.tertiary} />
          <Text style={styles.infoValue}>{formatDate(tournament.startDate)}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.spotsText}>
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
          </Text>
          <Text style={styles.teamsText}>
            {tournament.registeredTeams}/{tournament.maxTeams} teams
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${fillPercent}%`,
                backgroundColor:
                  fillPercent >= 90
                    ? Colors.dark.error
                    : fillPercent >= 60
                      ? Colors.dark.warning
                      : Colors.dark.primary,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: {
    color: Colors.dark.text,
    fontSize: 17,
    fontFamily: "Rajdhani_700Bold",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.error,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 1,
  },
  gameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gameText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
  },
  formatText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
    marginLeft: "auto",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoValue: {
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: "Rajdhani_600SemiBold",
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  spotsText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
  },
  teamsText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.surface,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
