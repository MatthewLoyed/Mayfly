import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type Habit } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface ButterflyHabitProps {
  habit: Habit;
  isHolding?: boolean;
  progress?: number; // 0-1 for hold progress
  onPress?: () => void;
}

/**
 * Butterfly lifecycle stages based on streak:
 * - Stage 1 (0-2 days): Egg 🥚
 * - Stage 2 (3-6 days): Caterpillar 🐛
 * - Stage 3 (7-13 days): Chrysalis 🟢
 * - Stage 4 (14+ days): Butterfly 🦋
 */
function getButterflyStage(streak: number): {
  stage: number;
  emoji: string;
  label: string;
  color: string;
} {
  if (streak === 0) {
    return { stage: 0, emoji: '🌱', label: 'Seed', color: '#8B7355' };
  } else if (streak <= 2) {
    return { stage: 1, emoji: '🥚', label: 'Egg', color: '#E8D5B7' };
  } else if (streak <= 6) {
    return { stage: 2, emoji: '🐛', label: 'Caterpillar', color: '#7CB342' };
  } else if (streak <= 13) {
    return { stage: 3, emoji: '🟢', label: 'Chrysalis', color: '#4CAF50' };
  } else {
    // Stage 4+: Butterfly - different colors based on streak milestones
    if (streak >= 30) {
      return { stage: 4, emoji: '🦋', label: 'Rare Butterfly', color: '#9C27B0' };
    } else if (streak >= 21) {
      return { stage: 4, emoji: '🦋', label: 'Beautiful Butterfly', color: '#FF9800' };
    } else {
      return { stage: 4, emoji: '🦋', label: 'Butterfly', color: '#2196F3' };
    }
  }
}

export function ButterflyHabit({ habit, isHolding = false, progress = 0, onPress }: ButterflyHabitProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const isComplete = habit.completedToday;
  
  const stage = getButterflyStage(habit.streak);
  const habitColor = habit.color || colors.tint;
  
  const scaleValue = useSharedValue(1);
  const progressValue = useSharedValue(0);
  const flutterValue = useSharedValue(0);

  // Animate scale on completion
  React.useEffect(() => {
    if (isComplete) {
      scaleValue.value = withSpring(1.15, { damping: 10 }, () => {
        scaleValue.value = withSpring(1, { damping: 10 });
      });
    }
  }, [isComplete]);

  // Animate progress ring
  React.useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 100 });
  }, [progress]);

  // Gentle flutter animation for butterflies
  React.useEffect(() => {
    if (stage.stage === 4 && !isHolding) {
      // Continuous gentle flutter loop
      const startFlutter = () => {
        flutterValue.value = withTiming(1, { duration: 2000 }, () => {
          flutterValue.value = withTiming(0, { duration: 2000 }, () => {
            startFlutter(); // Loop
          });
        });
      };
      startFlutter();
    } else {
      // Reset flutter when not a butterfly or when holding
      flutterValue.value = withTiming(0, { duration: 200 });
    }
  }, [stage.stage, isHolding]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { 
        translateY: stage.stage === 4 
          ? interpolate(flutterValue.value, [0, 1], [0, -3])
          : 0 
      },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progressValue.value, [0, 1], [0, 360]);
    return {
      opacity: isHolding && progressValue.value > 0 ? 1 : 0,
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const size = 140;
  const isCompleted = isComplete;

  return (
    <Animated.View style={[styles.container, containerStyle, { width: size, height: size }]}>
      <Pressable onPress={onPress} style={styles.pressable}>
        {/* Background circle with gradient effect */}
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isCompleted 
                ? habitColor 
                : colors.backgroundSubtle,
              borderWidth: 3,
              borderColor: isCompleted ? habitColor : stage.color,
              opacity: isCompleted ? 1 : 0.7,
            },
          ]}
        >
          {/* Progress ring for hold gesture */}
          {isHolding && (
            <Animated.View
              style={[
                styles.progressRing,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 4,
                  borderColor: colors.primary,
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent',
                },
                progressStyle,
              ]}
            />
          )}

          {/* Stage emoji/icon */}
          <View style={styles.stageContainer}>
            <ThemedText style={[styles.emoji, { fontSize: size * 0.35 }]}>
              {stage.emoji}
            </ThemedText>
            
            {/* Completion sparkle effect */}
            {isCompleted && (
              <View style={styles.sparkle}>
                <ThemedText style={styles.sparkleText}>✨</ThemedText>
              </View>
            )}
          </View>

          {/* Habit name */}
          <View style={styles.nameContainer}>
            {!!habit.icon && (
              <Ionicons
                name={habit.icon as any}
                size={16}
                color={isCompleted ? '#FFFFFF' : colors.text}
                style={{ marginBottom: 4 }}
              />
            )}
            <ThemedText
              style={[styles.name, { fontSize: size * 0.11 }]}
              numberOfLines={2}
              lightColor={isCompleted ? '#FFFFFF' : colors.text}
              darkColor={isCompleted ? '#FFFFFF' : colors.text}
            >
              {habit.name}
            </ThemedText>
          </View>

          {/* Stage label and streak */}
          <View style={styles.footer}>
            <ThemedText
              style={[styles.stageLabel, { fontSize: size * 0.08 }]}
              lightColor={isCompleted ? '#FFFFFF' : stage.color}
              darkColor={isCompleted ? '#FFFFFF' : stage.color}
            >
              {stage.label}
            </ThemedText>
            <ThemedText
              style={[styles.streak, { fontSize: size * 0.09 }]}
              lightColor={isCompleted ? '#FFFFFF' : colors.text}
              darkColor={isCompleted ? '#FFFFFF' : colors.text}
            >
              {habit.streak} {habit.streak === 1 ? 'day' : 'days'}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  stageContainer: {
    position: 'absolute',
    top: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkleText: {
    fontSize: 20,
  },
  nameContainer: {
    position: 'absolute',
    top: '50%',
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -20 }],
  },
  name: {
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLabel: {
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streak: {
    fontWeight: '600',
    opacity: 0.9,
  },
});

