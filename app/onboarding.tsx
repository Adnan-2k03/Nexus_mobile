import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { GAMES, SKILL_LEVELS, Game, SkillLevel } from "@/lib/game-data";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { createProfile } = useGame();
  const [step, setStep] = useState(0);
  const [gamertag, setGamertag] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<string, SkillLevel>>({});

  const toggleGame = (game: Game) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game],
    );
  };

  const setSkill = (game: string, skill: SkillLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSkillLevels((prev) => ({ ...prev, [game]: skill }));
  };

  const canProceed = () => {
    if (step === 0) return gamertag.trim().length >= 3;
    if (step === 1) return selectedGames.length > 0;
    if (step === 2) return true;
    return true;
  };

  const next = () => {
    if (step < 2) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await createProfile({
      gamertag: gamertag.trim(),
      bio,
      preferredGames: selectedGames,
      skillLevels,
    });
    router.replace("/(tabs)");
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.progressRow}>
              {[0, 1, 2].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.progressDot,
                    s <= step && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.stepLabel}>
              {step === 0
                ? "CREATE YOUR IDENTITY"
                : step === 1
                  ? "SELECT YOUR GAMES"
                  : "SET YOUR RANKS"}
            </Text>
          </View>

          {step === 0 && (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={32} color={Colors.dark.primary} />
              </View>
              <Text style={styles.title}>Choose Your Gamertag</Text>
              <Text style={styles.subtitle}>
                This is how other players will find you
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter gamertag..."
                placeholderTextColor={Colors.dark.textMuted}
                value={gamertag}
                onChangeText={setGamertag}
                autoCapitalize="none"
                maxLength={20}
              />
              <Text style={styles.charCount}>{gamertag.length}/20</Text>

              <Text style={[styles.subtitle, { marginTop: 20 }]}>
                Tell others about yourself (optional)
              </Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Write a short bio..."
                placeholderTextColor={Colors.dark.textMuted}
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={150}
              />
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="game-controller"
                  size={32}
                  color={Colors.dark.secondary}
                />
              </View>
              <Text style={styles.title}>Your Games</Text>
              <Text style={styles.subtitle}>
                Select the games you play. You can add more later.
              </Text>
              <View style={styles.gamesGrid}>
                {GAMES.map((game) => (
                  <Pressable
                    key={game}
                    style={[
                      styles.gameChip,
                      selectedGames.includes(game) && styles.gameChipSelected,
                    ]}
                    onPress={() => toggleGame(game)}
                  >
                    <Text
                      style={[
                        styles.gameChipText,
                        selectedGames.includes(game) &&
                          styles.gameChipTextSelected,
                      ]}
                    >
                      {game}
                    </Text>
                    {selectedGames.includes(game) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={Colors.dark.primary}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="trophy"
                  size={32}
                  color={Colors.dark.warning}
                />
              </View>
              <Text style={styles.title}>Your Skill Levels</Text>
              <Text style={styles.subtitle}>
                Set your rank for each selected game
              </Text>
              {selectedGames.map((game) => (
                <View key={game} style={styles.skillSection}>
                  <Text style={styles.skillGameName}>{game}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.skillRow}
                  >
                    {SKILL_LEVELS.map((skill) => (
                      <Pressable
                        key={skill}
                        style={[
                          styles.skillChip,
                          skillLevels[game] === skill &&
                            styles.skillChipSelected,
                        ]}
                        onPress={() => setSkill(game, skill)}
                      >
                        <Text
                          style={[
                            styles.skillChipText,
                            skillLevels[game] === skill &&
                              styles.skillChipTextSelected,
                          ]}
                        >
                          {skill}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
          {step > 0 && (
            <Pressable
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={Colors.dark.textSecondary}
              />
            </Pressable>
          )}
          <Pressable
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
              step === 0 && { flex: 1 },
            ]}
            onPress={next}
            disabled={!canProceed()}
          >
            <LinearGradient
              colors={
                canProceed()
                  ? [Colors.dark.primary, "#00C4CC"]
                  : [Colors.dark.textMuted, Colors.dark.textMuted]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>
                {step === 2 ? "Launch" : "Continue"}
              </Text>
              <Ionicons
                name={step === 2 ? "rocket" : "arrow-forward"}
                size={18}
                color="#0A0E1A"
              />
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.cardBorder,
  },
  progressDotActive: {
    backgroundColor: Colors.dark.primary,
  },
  stepLabel: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 2,
  },
  stepContent: {
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.glowCyan,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 26,
    fontFamily: "Rajdhani_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_400Regular",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    width: "100%",
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.dark.text,
    fontSize: 16,
    fontFamily: "Rajdhani_500Medium",
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  charCount: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: "Rajdhani_400Regular",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    width: "100%",
  },
  gameChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.card,
  },
  gameChipSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.glowCyan,
  },
  gameChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: "Rajdhani_500Medium",
  },
  gameChipTextSelected: {
    color: Colors.dark.primary,
  },
  skillSection: {
    width: "100%",
    marginBottom: 16,
  },
  skillGameName: {
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Rajdhani_600SemiBold",
    marginBottom: 8,
  },
  skillRow: {
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surface,
  },
  skillChipSelected: {
    borderColor: Colors.dark.warning,
    backgroundColor: "rgba(255, 184, 0, 0.15)",
  },
  skillChipText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
  },
  skillChipTextSelected: {
    color: Colors.dark.warning,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  nextText: {
    color: "#0A0E1A",
    fontSize: 16,
    fontFamily: "Rajdhani_700Bold",
    letterSpacing: 0.5,
  },
});
