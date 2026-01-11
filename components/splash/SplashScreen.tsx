import { WeeksCharacter } from '@/components/character/WeeksCharacter';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';

interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * Animated splash screen with character entrance animation
 * Similar to Duolingo's opening animation
 */
export function AppSplashScreen({ onFinish }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const characterY = useSharedValue(-100);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.8);

  useEffect(() => {
    // Keep native splash visible while we animate
    SplashScreen.preventAutoHideAsync();

    // Start animation sequence
    const startAnimation = () => {
      // Character entrance: slide down and fade in with scale
      characterY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });

      // Text entrance with delay
      textOpacity.value = withDelay(
        400,
        withTiming(1, {
          duration: 500,
          easing: Easing.out(Easing.cubic),
        })
      );
      textScale.value = withDelay(
        400,
        withSpring(1, {
          damping: 12,
          stiffness: 100,
        })
      );

      // Hide after animation completes
      setTimeout(() => {
        // Fade out
        opacity.value = withTiming(0, {
          duration: 300,
          easing: Easing.in(Easing.cubic),
        }, () => {
          runOnJS(setShowSplash)(false);
          runOnJS(SplashScreen.hideAsync)();
          runOnJS(onFinish)();
        });
      }, 2000); // Show for 2 seconds total
    };

    // Small delay before starting animation
    setTimeout(startAnimation, 100);
  }, [characterY, onFinish, opacity, scale, textOpacity, textScale]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: characterY.value },
      { scale: scale.value },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  if (!showSplash) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={characterStyle}>
        <WeeksCharacter size={120} mood="happy" animated={false} />
      </Animated.View>
      <Animated.View style={[styles.textContainer, textStyle]}>
        <ThemedText type="title" style={styles.title}>
          Mayfly
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Make every day count
        </ThemedText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 8,
    color: Colors.dark.tint,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    fontWeight: '500',
  },
});

