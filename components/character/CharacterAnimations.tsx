import { useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';

/**
 * Celebration animation - bounce and scale
 */
export function useCelebrationAnimation() {
  const scale = useSharedValue(1);
  const bounceY = useSharedValue(0);

  const celebrate = () => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    bounceY.value = withSequence(
      withSpring(-15, { damping: 6, stiffness: 250 }),
      withSpring(0, { damping: 8, stiffness: 200 })
    );
  };

  return { scale, bounceY, celebrate };
}

/**
 * Nod animation - subtle rotation
 */
export function useNodAnimation() {
  const rotation = useSharedValue(0);

  const nod = () => {
    rotation.value = withSequence(
      withTiming(10, { duration: 150 }),
      withTiming(-10, { duration: 150 }),
      withTiming(0, { duration: 150 })
    );
  };

  return { rotation, nod };
}

/**
 * Pulse animation - gentle scale pulse
 */
export function usePulseAnimation() {
  const scale = useSharedValue(1);

  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
  };

  return { scale, pulse };
}

