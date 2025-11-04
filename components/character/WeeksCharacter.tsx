import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { type CharacterMood } from '@/types/character';

interface WeeksCharacterProps {
  mood?: CharacterMood;
  size?: number;
  animated?: boolean;
}

/**
 * Weeks the Mayfly - emoji-based character with animations
 */
export function WeeksCharacter({ mood = 'happy', size = 80, animated = true }: WeeksCharacterProps) {
  const floatY = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      return;
    }

    // Idle float animation
    if (mood === 'happy' || mood === 'gentle') {
      floatY.value = withRepeat(
        withTiming(-5, { duration: 2000 }),
        -1,
        true
      );
    }

    // Celebrating bounce animation
    if (mood === 'celebrating') {
      bounceY.value = withRepeat(
        withSpring(-10, { damping: 8, stiffness: 100 }),
        -1,
        true
      );
      scale.value = withRepeat(
        withSpring(1.1, { damping: 10, stiffness: 150 }),
        -1,
        true
      );
    }

    // Encouraging nod animation
    if (mood === 'encouraging') {
      rotation.value = withRepeat(
        withTiming(5, { duration: 500 }),
        -1,
        true
      );
    }
  }, [mood, animated]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { translateY: bounceY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // Emoji representation - mayfly inspired
  const getCharacterEmoji = () => {
    // Using butterfly emoji as mayfly representation
    // Can be enhanced later with custom illustrations
    return '🦋';
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.characterContainer, floatStyle]}>
        <Text style={[styles.emoji, { fontSize: size * 0.8 }]}>
          {getCharacterEmoji()}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});

