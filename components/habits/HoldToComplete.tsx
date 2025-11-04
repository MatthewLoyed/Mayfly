import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface HoldToCompleteProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds
  children: (props: { isHolding: boolean; progress: number }) => React.ReactNode;
}

/**
 * Gesture wrapper for hold-to-complete interaction
 * Provides progress animation and haptic feedback
 */
export function HoldToComplete({
  onComplete,
  duration = 1000,
  children,
}: HoldToCompleteProps) {
  const [isHolding, setIsHolding] = useState(false);
  const progress = useSharedValue(0);
  const hapticTimers = useRef<NodeJS.Timeout[]>([]);

  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (intensity === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (intensity === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const clearHapticTimers = () => {
    hapticTimers.current.forEach((timer) => clearTimeout(timer));
    hapticTimers.current = [];
  };

  const handleComplete = () => {
    onComplete();
    triggerHaptic('medium');
  };

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setIsHolding(true);
      progress.value = withTiming(1, { duration });
      
      // Trigger haptics at milestones
      clearHapticTimers();
      hapticTimers.current = [
        setTimeout(() => triggerHaptic('light'), duration * 0.25),
        setTimeout(() => triggerHaptic('light'), duration * 0.5),
        setTimeout(() => triggerHaptic('light'), duration * 0.75),
        setTimeout(() => runOnJS(handleComplete)(), duration),
      ];
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      clearHapticTimers();
      setIsHolding(false);
      progress.value = withTiming(0, { duration: 200 });
    }
  };

  useEffect(() => {
    return () => {
      clearHapticTimers();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value > 0 ? 0.95 : 1,
  }));

  return (
    <LongPressGestureHandler
      minDurationMs={duration}
      onHandlerStateChange={handleGestureStateChange}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {children({ isHolding, progress: progress.value })}
      </Animated.View>
    </LongPressGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});

