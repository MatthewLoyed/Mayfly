import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface CharacterMessageProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  autoDismissDelay?: number;
}

/**
 * Speech bubble component for character messages
 */
export function CharacterMessage({
  message,
  visible,
  onDismiss,
  autoDismissDelay = 4000,
}: CharacterMessageProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      
      if (autoDismissDelay > 0) {
        const timer = setTimeout(() => {
          if (onDismiss) {
            onDismiss();
          }
        }, autoDismissDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]} entering={FadeIn} exiting={FadeOut}>
      <View style={styles.bubble}>
        <ThemedText style={styles.message} lightColor="#FFFFFF" darkColor="#FFFFFF">
          {message}
        </ThemedText>
        {/* Speech bubble tail */}
        <View style={styles.tail} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 92, 231, 0.95)', // Primary purple with transparency
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  tail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(108, 92, 231, 0.95)',
  },
});

