import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface HoldToCompleteProps {
  onComplete: () => void;
  onTap?: () => void;
  duration?: number; // Duration in milliseconds
  children: (props: {
    isHolding: boolean;
    progress: SharedValue<number>;
  }) => React.ReactNode;
}

/**
 * Gesture wrapper for hold-to-complete interaction
 * Provides progress animation and haptic feedback
 */
export function HoldToComplete({
  onComplete,
  onTap,
  duration = 1000,
  children,
}: HoldToCompleteProps) {
  const [isHolding, setIsHolding] = useState(false);
  const progress = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const hapticTimers = useRef<NodeJS.Timeout[]>([]);
  const startTime = useRef(0);

  const triggerHaptic = (intensity: "selection" | "medium" | "success" = "selection") => {
    if (Platform.OS === 'web') return;
    try {
      if (intensity === "selection") {
        Haptics.selectionAsync();
      } else if (intensity === "medium") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (intensity === "success") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {}
  };

  const clearHapticTimers = () => {
    hapticTimers.current.forEach((timer) => clearTimeout(timer));
    hapticTimers.current = [];
  };

  const handleComplete = () => {
    onComplete();
    triggerHaptic("success");
  };

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      startTime.current = Date.now();
      pressScale.value = withSpring(0.96);

      const animationDelay = 150;
      progress.value = withDelay(
        animationDelay,
        withTiming(1, { duration: duration }),
      );

      clearHapticTimers();
      hapticTimers.current = [
        setTimeout(() => {
          runOnJS(setIsHolding)(true);
          triggerHaptic("selection");
        }, animationDelay),
        setTimeout(
          () => triggerHaptic("selection"),
          animationDelay + duration * 0.33,
        ),
        setTimeout(
          () => triggerHaptic("selection"),
          animationDelay + duration * 0.66,
        ),
        setTimeout(() => runOnJS(handleComplete)(), animationDelay + duration),
      ];
    } else if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    ) {
      const elapsed = Date.now() - startTime.current;

      clearHapticTimers();
      setIsHolding(false);
      pressScale.value = withSpring(1);

      if (event.nativeEvent.state === State.END && elapsed < 250 && onTap) {
        progress.value = 0;
        runOnJS(onTap)();
        triggerHaptic("selection");
      } else {
        progress.value = withTiming(0, { duration: 200 });
      }
    }
  };

  useEffect(() => {
    return () => {
      clearHapticTimers();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
    shadowColor: "#9CAF88", // Sage Glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: interpolate(progress.value, [0, 1], [0, 0.6]),
    shadowRadius: interpolate(progress.value, [0, 1], [0, 20]),
    elevation: interpolate(progress.value, [0, 1], [0, 8]),
  }));

  return (
    <LongPressGestureHandler
      minDurationMs={0} // Immediate response
      onHandlerStateChange={handleGestureStateChange}
      maxDist={20}
      shouldCancelWhenOutside={false}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {children({ isHolding, progress })}
      </Animated.View>
    </LongPressGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
});
