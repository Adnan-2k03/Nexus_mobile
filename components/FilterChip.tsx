import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    backgroundColor: Colors.dark.surface,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: Colors.dark.glowCyan,
    borderColor: Colors.dark.primary,
  },
  chipText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontFamily: "Rajdhani_500Medium",
  },
  chipTextSelected: {
    color: Colors.dark.primary,
  },
});
