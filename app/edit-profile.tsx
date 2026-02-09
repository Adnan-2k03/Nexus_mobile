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
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useGame } from "@/contexts/GameContext";
import { GAMES, SKILL_LEVELS, Game, SkillLevel } from "@/lib/game-data";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useGame();
  const [gamertag, setGamertag] = useState(user?.gamertag || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [selectedGames, setSelectedGames] = useState<Game[]>(
    user?.preferredGames || [],
  );
  const [skillLevels, setSkillLevels] = useState<Record<string, SkillLevel>>(
    user?.skillLevels || {},
  );

  const toggleGame = (game: Game) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game],
    );
  };

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateProfile({
      gamertag: gamertag.trim() || user?.gamertag,
      bio,
      location,
      preferredGames: selectedGames,
      skillLevels,
    });
    router.back();
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.dark.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable onPress={handleSave}>
          <Ionicons name="checkmark" size={22} color={Colors.dark.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Gamertag</Text>
          <TextInput
            style={styles.input}
            value={gamertag}
            onChangeText={setGamertag}
            placeholderTextColor={Colors.dark.textMuted}
            maxLength={20}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about yourself..."
            placeholderTextColor={Colors.dark.textMuted}
            multiline
            maxLength={200}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
            placeholderTextColor={Colors.dark.textMuted}
          />

          <Text style={styles.label}>Games</Text>
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
                    selectedGames.includes(game) && styles.gameChipTextSelected,
                  ]}
                >
                  {game}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedGames.map((game) => (
            <View key={game} style={styles.skillSection}>
              <Text style={styles.skillLabel}>{game} Rank</Text>
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
                      skillLevels[game] === skill && styles.skillChipSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSkillLevels((prev) => ({ ...prev, [game]: skill }));
                    }}
                  >
                    <Text
                      style={[
                        styles.skillChipText,
                        skillLevels[game] === skill && styles.skillChipTextSelected,
                      ]}
                    >
                      {skill}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
    fontSize: 17,
    fontFamily: "Rajdhani_700Bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 14,
    fontFamily: "Rajdhani_600SemiBold",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 15,
    fontFamily: "Rajdhani_500Medium",
    marginBottom: 14,
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  gameChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
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
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
  },
  gameChipTextSelected: {
    color: Colors.dark.primary,
  },
  skillSection: {
    marginBottom: 14,
  },
  skillLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
    marginBottom: 6,
  },
  skillRow: {
    gap: 6,
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
    fontSize: 12,
    fontFamily: "Rajdhani_500Medium",
  },
  skillChipTextSelected: {
    color: Colors.dark.warning,
  },
});
