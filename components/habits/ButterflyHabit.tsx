import { HabitStatsCard } from "@/components/habits/HabitStatsCard";
import { HoldToComplete } from "@/components/habits/HoldToComplete";
import { ThemedText } from "@/components/themed-text";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { HapticType, TactileButton } from "@/components/ui/TactileButton";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { type Habit } from "@/types/habit";
import { Ionicons } from "@expo/vector-icons";
import { AppIcons } from "@/constants/icons";
import React, { useState } from "react";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ButterflyHabitProps {
  habit: Habit;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  isEditing?: boolean;
  size?: number;
}

export function ButterflyHabit({
  habit,
  onComplete,
  onDelete,
  isEditing,
  size: propSize,
}: ButterflyHabitProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const isComplete = habit.completedToday;

  // Use the habit's assigned color, or fallback to tint
  const habitColor = habit.color || colors.tint;

  // Default fixed size for the circle
  const size = propSize || 100;
  const strokeWidth = 12; // Much thicker for premium visibility

  const scaleValue = useSharedValue(1);
  const flipValue = useSharedValue(0); // 0 = Front, 1 = Back
  const [isFlipped, setIsFlipped] = useState(false);

  // We need a stable complete progress value for when it's finished
  const completionProgress = useSharedValue(1);

  // Animate scale on completion
  React.useEffect(() => {
    if (isComplete) {
      scaleValue.value = withSpring(1.1, { damping: 10 }, () => {
        scaleValue.value = withSpring(1, { damping: 10 });
      });
    }
  }, [isComplete]);

  const toggleFlip = () => {
    const newVal = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);
    flipValue.value = withTiming(newVal, { duration: 300 });
    // Rule 2: light tap for selection change (front/back)
    Haptics.selectionAsync();
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [0, 180]);
    return {
      flex: 1, 
      transform: [
        { scale: scaleValue.value },
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: "hidden",
      opacity: flipValue.value > 0.5 ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [180, 360]);
    return {
      flex: 1, 
      transform: [
        { scale: scaleValue.value },
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: "hidden",
      opacity: flipValue.value <= 0.5 ? 0 : 1,
    };
  });

  // Dynamic Background Color for Front
  const bgStyle = {
    backgroundColor: isComplete ? habitColor : "rgba(255,255,255,0.1)",
    borderColor: isComplete ? "#FFFFFF" : "transparent",
    borderWidth: isComplete ? 3 : 0,
  };

  const iconColor = "#FFFFFF";

  return (
    <View style={styles.wrapper}>
      <View style={{ width: size, height: size }}>
        {/* Back Face (Stats) - Only interactive when flipped and NOT editing */}
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents={isFlipped && !isEditing ? "auto" : "none"}
        >
          <Pressable onPress={toggleFlip} style={{ flex: 1 }}>
            <Animated.View
              style={[
                backAnimatedStyle,
                { width: size, height: size, opacity: isEditing ? 0.6 : 1 },
              ]}
            >
              <HabitStatsCard
                habit={habit}
                size={size}
                color={habitColor}
              // onDelete removed here, handled by parent overlay
              />
            </Animated.View>
          </Pressable>
        </View>

        {/* Front Face (Icon + Ring) - Only interactive when NOT flipped and NOT editing */}
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents={!isFlipped && !isEditing ? "auto" : "none"}
        >
          <HoldToComplete
            onComplete={() => onComplete(habit.id)}
            onTap={toggleFlip}
            duration={800}
          >
            {({ progress }) => (
              <Animated.View
                style={[
                  frontAnimatedStyle,
                  { width: size, height: size, opacity: isEditing ? 0.6 : 1 },
                ]}
              >
                <View style={styles.innerContent}>
                  {/* Main Circle */}
                  <View
                    style={[
                      styles.circle,
                      bgStyle,
                      {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                      },
                    ]}
                  >
                    {habit.icon ? (
                      <Ionicons
                        name={habit.icon as any}
                        size={size * 0.5}
                        color={iconColor}
                      />
                    ) : isComplete ? (
                      <Ionicons
                        name={AppIcons.checkmark}
                        size={size * 0.5}
                        color={iconColor}
                      />
                    ) : (
                      <ThemedText
                        style={{
                          fontSize: size * 0.4,
                          color: iconColor,
                          fontWeight: "800",
                        }}
                      >
                        {habit.name.charAt(0).toUpperCase()}
                      </ThemedText>
                    )}
                  </View>

                  {/* Progress Ring Overlay */}
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <CircularProgress
                      size={size}
                      strokeWidth={strokeWidth}
                      progress={
                        isComplete
                          ? completionProgress
                          : progress || completionProgress
                      }
                      color={isComplete ? "#FFFFFF" : habitColor}
                    />
                  </View>
                </View>
              </Animated.View>
            )}
          </HoldToComplete>
        </View>

        {/* Edit Mode Overlay - Delete Badge */}
        {isEditing && onDelete && (
          <Animated.View
            style={[styles.deleteBadgeContainer, { width: size, height: size }]}
            pointerEvents="box-none"
            entering={FadeIn.springify().damping(12)}
            exiting={FadeOut.duration(200)}
          >
            <TactileButton
              onPress={() => onDelete(habit.id)}
              style={styles.deleteBadge}
              hapticType={HapticType.ImpactMedium}
            >
              <Ionicons name={AppIcons.close} size={16} color="#FFF" />
            </TactileButton>
          </Animated.View>
        )}
      </View>

      {/* Label Below */}
      <View style={[styles.labelContainer, { width: size + 20 }]}>
        <View style={[styles.namePill, { backgroundColor: colors.cardBackground, borderColor: colors.habitStroke + '33' }]}>
          <ThemedText
            style={styles.name}
            numberOfLines={1}
            ellipsizeMode="tail"
            lightColor={colors.text}
            darkColor={colors.text}
          >
            {habit.name}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  innerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9CAF88",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  labelContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  namePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deleteBadgeContainer: {
    position: "absolute",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 100,
  },
  deleteBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF3B30", // iOS System Red
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#FFF",
  },
});
