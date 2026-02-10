import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import {
  GAMES,
  REGIONS,
  SKILL_LEVELS,
  MATCH_TYPES,
  Game,
  Region,
  SkillLevel,
  MatchType,
  FeedType,
} from "@/lib/game-data";

export default function CreateMatchScreen() {
  const insets = useSafeAreaInsets();
  const { createMatch, user, spendCoins } = useGame();
  const [feedType, setFeedType] = useState<FeedType>("lfg");
  const [game, setGame] = useState<Game | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [skill, setSkill] = useState<SkillLevel | null>(null);
  const [mode, setMode] = useState<MatchType | null>(null);
  const [description, setDescription] = useState("");
  const [playersNeeded, setPlayersNeeded] = useState(1);

  const isValid = game && region && skill && mode && description.trim();
  const cost = 10;

  const handleCreate = async () => {
    if (!isValid) return;
    const canAfford = await spendCoins(cost);
    if (!canAfford) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await createMatch({
      gameName: game!,
      region: region!,
      skillLevel: skill!,
      gameMode: mode!,
      description: description.trim(),
      playersNeeded,
      feedType,
    });
    router.back();
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Match</Text>
        <View style={styles.costBadge}>
          <Ionicons name="diamond" size={12} color={Colors.dark.warning} />
          <Text style={styles.costText}>{cost}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Post Type</Text>
          <View style={styles.feedTypeRow}>
            <Pressable
              style={[styles.feedTypeBtn, feedType === "lfg" && styles.feedTypeBtnActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFeedType("lfg");
              }}
            >
              <Ionicons name="people" size={16} color={feedType === "lfg" ? Colors.dark.primary : Colors.dark.textMuted} />
              <Text style={[styles.feedTypeText, feedType === "lfg" && styles.feedTypeTextActive]}>
                LFG (Looking for Group)
              </Text>
            </Pressable>
            <Pressable
              style={[styles.feedTypeBtn, feedType === "lfo" && styles.feedTypeBtnActiveLfo]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFeedType("lfo");
              }}
            >
              <Ionicons name="radio-button-on" size={14} color={feedType === "lfo" ? Colors.dark.secondary : Colors.dark.textMuted} />
              <Text style={[styles.feedTypeText, feedType === "lfo" && styles.feedTypeTextActiveLfo]}>
                LFO (Looking for Opponent)
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Game</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {GAMES.map((g) => (
              <Pressable
                key={g}
                style={[styles.chip, game === g && styles.chipSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setGame(g);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    game === g && styles.chipTextSelected,
                  ]}
                >
                  {g}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Match Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {MATCH_TYPES.map((m) => (
              <Pressable
                key={m}
                style={[styles.chip, mode === m && styles.chipSelectedSecondary]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMode(m);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    mode === m && styles.chipTextSelectedSecondary,
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Region</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {REGIONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.chip, region === r && styles.chipSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRegion(r);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    region === r && styles.chipTextSelected,
                  ]}
                >
                  {r}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Skill Level</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {SKILL_LEVELS.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, skill === s && styles.chipSelectedWarning]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSkill(s);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    skill === s && styles.chipTextSelectedWarning,
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Players Needed</Text>
          <View style={styles.counterRow}>
            <Pressable
              style={styles.counterBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPlayersNeeded(Math.max(1, playersNeeded - 1));
              }}
            >
              <Ionicons name="remove" size={20} color={Colors.dark.text} />
            </Pressable>
            <Text style={styles.counterValue}>{playersNeeded}</Text>
            <Pressable
              style={styles.counterBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPlayersNeeded(Math.min(9, playersNeeded + 1));
              }}
            >
              <Ionicons name="add" size={20} color={Colors.dark.text} />
            </Pressable>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What are you looking for?"
            placeholderTextColor={Colors.dark.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) },
          ]}
        >
          <Pressable
            style={[styles.createBtn, !isValid && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!isValid}
          >
            <LinearGradient
              colors={
                isValid
                  ? [Colors.dark.primary, "#00C4CC"]
                  : [Colors.dark.textMuted, Colors.dark.textMuted]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createGradient}
            >
              <Ionicons name="flash" size={18} color="#0A0E1A" />
              <Text style={styles.createText}>Post Match ({cost} Coins)</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.cardBorder,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontFamily: "Rajdhani_700Bold",
  },
  costBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 184, 0, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  costText: {
    color: Colors.dark.warning,
    fontSize: 12,
    fontFamily: "Rajdhani_700Bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: "Rajdhani_600SemiBold",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  feedTypeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  feedTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.card,
  },
  feedTypeBtnActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.glowCyan,
  },
  feedTypeBtnActiveLfo: {
    borderColor: Colors.dark.secondary,
    backgroundColor: Colors.dark.glowMagenta,
  },
  feedTypeText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
  },
  feedTypeTextActive: {
    color: Colors.dark.primary,
  },
  feedTypeTextActiveLfo: {
    color: Colors.dark.secondary,
  },
  chipRow: {
    gap: 8,
    marginBottom: 20,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.card,
  },
  chipSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.glowCyan,
  },
  chipSelectedSecondary: {
    borderColor: Colors.dark.secondary,
    backgroundColor: Colors.dark.glowMagenta,
  },
  chipSelectedWarning: {
    borderColor: Colors.dark.warning,
    backgroundColor: "rgba(255, 184, 0, 0.15)",
  },
  chipText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
  },
  chipTextSelected: {
    color: Colors.dark.primary,
  },
  chipTextSelectedSecondary: {
    color: Colors.dark.secondary,
  },
  chipTextSelectedWarning: {
    color: Colors.dark.warning,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  counterValue: {
    color: Colors.dark.text,
    fontSize: 22,
    fontFamily: "Rajdhani_700Bold",
    minWidth: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Rajdhani_500Medium",
    height: 80,
    textAlignVertical: "top",
  },
  charCount: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  createBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  createText: {
    color: "#0A0E1A",
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
  },
});
