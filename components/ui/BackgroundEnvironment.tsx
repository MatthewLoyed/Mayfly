import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

interface BackgroundEnvironmentProps {
  children?: React.ReactNode;
}

/**
 * Provides a premium ambient background with floating botanical blobs.
 * Used to unify the visual excellence across all main app tabs.
 */
export function BackgroundEnvironment({ children }: BackgroundEnvironmentProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const bgFloatY1 = useSharedValue(0);
  const bgFloatY2 = useSharedValue(0);

  useEffect(() => {
    bgFloatY1.value = withRepeat(
      withTiming(20, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bgFloatY2.value = withRepeat(
      withTiming(-20, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const bgStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: bgFloatY1.value }, 
      { scale: 1 + bgFloatY1.value / 200 }
    ],
  }));

  const bgStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: bgFloatY2.value }, 
      { scale: 1.2 - bgFloatY2.value / 200 }
    ],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSubtle]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated background elements */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View 
          style={[
            styles.bgBlob, 
            styles.bgBlob1, 
            bgStyle1, 
            { backgroundColor: theme.secondary }
          ]} 
        />
        <Animated.View 
          style={[
            styles.bgBlob, 
            styles.bgBlob2, 
            bgStyle2, 
            { backgroundColor: theme.tint }
          ]} 
        />
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.12,
  },
  bgBlob1: {
    top: 100,
    right: -50,
    width: 250,
    height: 250,
    backgroundColor: '#B5A8D6', // Fallback color
  },
  bgBlob2: {
    bottom: 200,
    left: -80,
    width: 300,
    height: 300,
    backgroundColor: '#9CAF88', // Fallback color
  },
});
