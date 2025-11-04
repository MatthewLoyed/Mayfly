import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type Habit } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StreakIndicator } from './StreakIndicator';

interface HabitCircleProps {
  habit: Habit;
  size?: number;
  onPress?: () => void;
  isHolding?: boolean;
  progress?: number; // 0-1 for hold progress
  noMargin?: boolean; // Set to true to remove default margin for grid layouts
  onDelete?: (habitId: string) => void;
}

/**
 * Circular habit component with visual states
 */
export function HabitCircle({
  habit,
  size = 160,
  onPress,
  isHolding = false,
  progress = 0,
  noMargin = false,
  onDelete,
}: HabitCircleProps) {
  const colorScheme = useColorScheme();
  const isComplete = habit.completedToday;
  const colors = Colors[colorScheme ?? 'light'];
  const progressValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const flipValue = useSharedValue(0); // 0 front, 1 back
  const [isBack, setIsBack] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  // Utility: dim an RGB hex color with alpha
  const getDimmed = (hex: string, alpha: number) => {
    const value = hex.replace('#', '');
    const bigint = parseInt(value.length === 3
      ? value.split('').map((c) => c + c).join('')
      : value, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Update progress value when prop changes
  React.useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]); // progressValue is a shared value and doesn't need to be in deps

  // Animate a subtle scale while holding
  React.useEffect(() => {
    scaleValue.value = withTiming(isHolding ? 1.03 : 1, { duration: 150 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHolding]);

  // Celebrate completion with a pop
  React.useEffect(() => {
    if (isComplete) {
      scaleValue.value = withTiming(1.08, { duration: 120 }, () => {
        scaleValue.value = withTiming(1, { duration: 120 });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // Use habit's assigned color if available, otherwise fall back to theme colors
  const habitColor = habit.color || colors.habitIncomplete;
  const incompleteColor = habitColor;
  const backFaceColor = getDimmed(habitColor, colorScheme === 'dark' ? 0.4 : 0.85);
  
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: isComplete ? colors.habitComplete : incompleteColor,
    borderWidth: 2,
    borderColor: isComplete ? colors.habitComplete : habitColor,
  };

  // Animated progress ring
  const progressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progressValue.value, [0, 1], [0, 360]);
    const opacity = isHolding && progressValue.value > 0 ? 1 : 0;
    
    return {
      opacity,
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  // Flip animation
  const flipStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
    };
  });

  const backFlipStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  const handlePress = () => {
    const next = !isBack;
    setIsBack(next);
    flipValue.value = withTiming(next ? 1 : 0, { duration: 250 });
    if (onPress) onPress();
  };

  const startConfirmDelete = () => setConfirmingDelete(true);
  const doDelete = () => {
    if (!onDelete) return;
    onDelete(habit.id);
    setConfirmingDelete(false);
  };

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, noMargin && { margin: 0 }, containerAnimatedStyle]}>
      {/* FRONT */}
      <Animated.View style={[styles.cardFace, flipStyle]}>
        <Pressable onPress={handlePress} style={[styles.circle, circleStyle]}>
          <ThemedView
            style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
            lightColor={isComplete ? colors.habitComplete : incompleteColor}
            darkColor={isComplete ? colors.habitComplete : incompleteColor}
          >
        {/* Progress ring for hold gesture */}
        {isHolding && (
          <Animated.View style={[styles.progressRing, {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 4,
            borderColor: colors.primary,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
          }, progressStyle]} />
        )}

        {/* Checkmark icon when complete */}
        {isComplete && (
          <View style={styles.checkmark}>
            <Text style={[styles.checkmarkText, { fontSize: size * 0.3 }]}>✓</Text>
          </View>
        )}

        {/* Habit name */}
        <View style={styles.nameContainer}>
          {!!habit.icon && (
            <Ionicons
              name={habit.icon as any}
              size={Math.max(18, size * 0.22)}
              color={isComplete ? '#FFFFFF' : colors.text}
              style={{ marginBottom: 6 }}
            />
          )}
          <ThemedText
            style={[styles.name, { fontSize: size * 0.12 }]}
            numberOfLines={2}
            lightColor={isComplete ? '#FFFFFF' : colors.text}
            darkColor={isComplete ? '#FFFFFF' : colors.text}
          >
            {habit.name}
          </ThemedText>
        </View>

        {/* Streak days label at bottom */}
        <View style={styles.daysContainer}>
          <ThemedText
            style={{ fontSize: Math.max(10, size * 0.1), fontWeight: '600' }}
            lightColor={isComplete ? '#FFFFFF' : colors.text}
            darkColor={isComplete ? '#FFFFFF' : colors.text}
          >
            {habit.streak} {habit.streak === 1 ? 'day' : 'days'}
          </ThemedText>
        </View>
          </ThemedView>
        </Pressable>
      </Animated.View>

      {/* BACK */}
      <Animated.View style={[styles.cardFace, backFlipStyle]}>
        <ThemedView
          style={[styles.circle, { width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: habitColor }]}
          lightColor={backFaceColor}
          darkColor={backFaceColor}
        >
          <View style={styles.backContent}>
            <Pressable onPress={handlePress} style={styles.backTapArea}>
            <ThemedText style={styles.backTitle}>
              {habit.name}
            </ThemedText>
            <ThemedText style={styles.backSubtitle}>
              Streak: {habit.streak} {habit.streak === 1 ? 'day' : 'days'}
            </ThemedText>
            <View style={styles.backSpacer} />
            </Pressable>
            <View style={styles.backFooter}>
              {confirmingDelete ? (
                <View style={styles.confirmRow}>
                  <ThemedText style={styles.confirmPrompt}>Are you sure?</ThemedText>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: colors.warning, borderColor: colors.warning }]}
                    onPress={(e) => { e.stopPropagation(); doDelete(); }}
                    onPressIn={(e) => e.stopPropagation()}
                    onPressOut={(e) => e.stopPropagation()}
                    accessibilityRole="button"
                    accessibilityLabel={`Confirm delete habit ${habit.name}`}
                  >
                    <ThemedText style={styles.deleteButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">Delete</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.warning, borderColor: colors.warning }]}
                  onPress={(e) => { e.stopPropagation(); startConfirmDelete(); }}
                  onPressIn={(e) => e.stopPropagation()}
                  onPressOut={(e) => e.stopPropagation()}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete habit ${habit.name}`}
                >
                  <ThemedText style={styles.deleteButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">Delete</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ThemedView>
      </Animated.View>

      {/* Streak indicator */}
      {habit.streak > 0 && <StreakIndicator streak={habit.streak} size={size * 0.25} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    margin: 8,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFace: {
    width: '100%',
    height: '100%',
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  checkmark: {
    position: 'absolute',
    top: '20%',
    right: '20%',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  nameContainer: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    textAlign: 'center',
    fontWeight: '600',
  },
  daysContainer: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  backContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
    gap: 6,
    position: 'relative',
  },
  backTapArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  backSpacer: {
    flex: 1,
  },
  backFooter: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  backSubtitle: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 12,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
    maxWidth: '60%',
  },
  deleteButtonText: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  confirmRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99999955',
    backgroundColor: '#00000010',
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontWeight: '700',
  },
  confirmPrompt: {
    fontWeight: '700',
    marginRight: 8,
  },
  backClose: {
    fontSize: 12,
    opacity: 0.8,
  },
});

