import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StreakIndicatorProps {
  streak: number;
  size?: number;
}

/**
 * Streak badge indicator for habits
 */
export function StreakIndicator({ streak, size = 24 }: StreakIndicatorProps) {
  const colorScheme = useColorScheme();
  const streakColor = Colors[colorScheme ?? 'light'].streak;

  if (streak === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: streakColor, width: size, height: size }]}>
      <ThemedText style={[styles.text, { fontSize: size * 0.4 }]} lightColor="#FFFFFF" darkColor="#FFFFFF">
        {streak > 99 ? '99+' : streak}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontWeight: 'bold',
  },
});

