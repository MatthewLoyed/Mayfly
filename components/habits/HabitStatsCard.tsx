import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { type Habit } from "@/types/habit";
import { Ionicons } from "@expo/vector-icons";
import { AppIcons } from "@/constants/icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface HabitStatsCardProps {
  habit: Habit;
  size: number;
  color: string;
}

export function HabitStatsCard({
  habit,
  size,
  color,
}: HabitStatsCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.backgroundSubtle,
          borderColor: color,
          borderWidth: 2,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name={AppIcons.flame} size={12} color={color} />
          <ThemedText style={[styles.stat, { color }]}>
            {habit.streak}
          </ThemedText>
        </View>
        <ThemedText style={styles.label}>Streak</ThemedText>

        <View style={styles.divider} />

        {/* Placeholder for "Best" or "Completion Rate" */}
        <View style={styles.row}>
          <Ionicons name={AppIcons.trophy} size={12} color={colors.text} />
          <ThemedText style={styles.stat}>--</ThemedText>
        </View>
        <ThemedText style={styles.label}>Best</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    overflow: "hidden",
    padding: 8, // Add explicit padding to keep content away from edges
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 1, // Tighter gap
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2, // Tighter gap
  },
  stat: {
    fontWeight: "bold",
    fontSize: 14, // Smaller font
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
    opacity: 0.9,
  },
  divider: {
    height: 1,
    width: 30, // Shorter divider
    backgroundColor: "rgba(128,128,128,0.4)",
    marginVertical: 2,
  },
});
