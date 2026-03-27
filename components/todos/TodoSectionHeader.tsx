import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

interface TodoSectionHeaderProps {
  title: string;
  count: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function TodoSectionHeader({ title, count, isCollapsed, onToggle }: TodoSectionHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handlePress = () => {
    Haptics.selectionAsync();
    onToggle();
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(isCollapsed ? "-90deg" : "0deg") }],
  }));

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={arrowStyle}>
          <IconSymbol name="chevron.down" size={18} color={colors.textSecondary} />
        </Animated.View>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={[styles.badge, { backgroundColor: colors.cardBackground }]}>
          <ThemedText style={styles.badgeText}>{count}</ThemedText>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.habitStroke }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  divider: {
    height: 1,
    marginTop: 8,
    opacity: 0.3,
  },
});
