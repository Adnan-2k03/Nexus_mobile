import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { MatchRequest } from "@/lib/game-data";

interface MatchCardProps {
  match: MatchRequest;
  onJoin: (id: string) => void;
  isOwnMatch?: boolean;
}

const GAME_ICONS: Record<string, string> = {
  Valorant: "sword-cross",
  CS2: "pistol",
  "League of Legends": "shield-crown",
  "Apex Legends": "target",
  Fortnite: "hammer",
  "Overwatch 2": "shield",
  "Rocket League": "car-sports",
  "Call of Duty": "ammunition",
  "Rainbow Six Siege": "security",
  "Dota 2": "wizard-hat",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

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

export default function MatchCard({ match, onJoin, isOwnMatch }: MatchCardProps) {
  const isFilled = match.status === "filled";
  const slotsText = `${match.playersJoined}/${match.playersNeeded}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: match.avatar }]}>
          <Text style={styles.avatarText}>
            {match.gamertag.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.gamertag}>{match.gamertag}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{match.level}</Text>
            </View>
          </View>
          <Text style={styles.timeText}>{timeAgo(match.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, isFilled && styles.filledBadge]}>
          <Text style={[styles.statusText, isFilled && styles.filledText]}>
            {isFilled ? "FILLED" : "OPEN"}
          </Text>
        </View>
      </View>

      <View style={styles.gameRow}>
        <MaterialCommunityIcons
          name={(GAME_ICONS[match.gameName] || "gamepad-variant") as any}
          size={18}
          color={Colors.dark.primary}
        />
        <Text style={styles.gameName}>{match.gameName}</Text>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{match.gameMode}</Text>
        </View>
      </View>

      <Text style={styles.description}>{match.description}</Text>

      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <Ionicons name="globe-outline" size={12} color={Colors.dark.textSecondary} />
          <Text style={styles.tagText}>{match.region}</Text>
        </View>
        <View style={styles.tag}>
          <Ionicons name="trophy-outline" size={12} color={getSkillColor(match.skillLevel)} />
          <Text style={[styles.tagText, { color: getSkillColor(match.skillLevel) }]}>
            {match.skillLevel}
          </Text>
        </View>
        <View style={styles.tag}>
          <Ionicons name="people-outline" size={12} color={Colors.dark.textSecondary} />
          <Text style={styles.tagText}>{slotsText}</Text>
        </View>
      </View>

      {!isOwnMatch && !isFilled && (
        <Pressable
          style={({ pressed }) => [
            styles.joinButton,
            pressed && styles.joinButtonPressed,
          ]}
          onPress={() => onJoin(match.id)}
        >
          <Ionicons name="flash" size={16} color="#0A0E1A" />
          <Text style={styles.joinText}>Join Match</Text>
        </Pressable>
      )}
    </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0A0E1A",
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
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
  timeText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
    marginTop: 1,
  },
  statusBadge: {
    backgroundColor: Colors.dark.glowCyan,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  filledBadge: {
    backgroundColor: Colors.dark.glowMagenta,
  },
  statusText: {
    color: Colors.dark.primary,
    fontSize: 11,
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 1,
  },
  filledText: {
    color: Colors.dark.secondary,
  },
  gameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  gameName: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: "Rajdhani_600SemiBold",
    flex: 1,
  },
  modeBadge: {
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeText: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: "Rajdhani_500Medium",
  },
  description: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
    marginBottom: 10,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
  },
  joinButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  joinButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  joinText: {
    color: "#0A0E1A",
    fontSize: 14,
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 0.5,
  },
});
