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
  const bgFloatY3 = useSharedValue(0);

  useEffect(() => {
    bgFloatY1.value = withRepeat(
      withTiming(30, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bgFloatY2.value = withRepeat(
      withTiming(-30, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bgFloatY3.value = withRepeat(
      withTiming(15, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const bgStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: bgFloatY1.value }, 
      { scale: 1.1 + bgFloatY1.value / 150 }
    ],
  }));

  const bgStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: bgFloatY2.value }, 
      { scale: 1.3 - bgFloatY2.value / 150 }
    ],
  }));

  const bgStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: bgFloatY3.value }, 
      { translateX: bgFloatY3.value * 2 },
      { scale: 1 + bgFloatY3.value / 100 }
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
        <Animated.View 
          style={[
            styles.bgBlob, 
            styles.bgBlob3, 
            bgStyle3, 
            { backgroundColor: theme.primary }
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
    opacity: 0.15, // Slightly increased
  },
  bgBlob1: {
    top: 50,
    right: -100,
    width: 350,
    height: 350,
  },
  bgBlob2: {
    bottom: 50,
    left: -150,
    width: 450,
    height: 450,
  },
  bgBlob3: {
    top: '40%',
    left: '20%',
    width: 200,
    height: 200,
    opacity: 0.08,
  },
});
