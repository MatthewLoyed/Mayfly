import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Circle, Path, G, Line } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  withRepeat, 
  withTiming, 
  withSequence, 
  useSharedValue,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedLine = Animated.createAnimatedComponent(Line);

interface MayflyVisualProps {
  stage: number; // 0: larva, 1: nymph, 2: emerging, 3: flight
  color: string;
}

export function MayflyVisual({ stage, color }: MayflyVisualProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const pulse = useSharedValue(0);
  const flight = useSharedValue(0);
  const wings = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    flight.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    wings.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const bodyPulseProps = useAnimatedProps(() => ({
    ry: interpolate(pulse.value, [0, 1], [16, 17]),
  }));

  const bodyNymphProps = useAnimatedProps(() => ({
    ry: interpolate(pulse.value, [0, 1], [18, 19]),
  }));

  const wingsNymphLeftProps = useAnimatedProps(() => ({
    d: `M 22 32 Q ${interpolate(pulse.value, [0, 1], [16, 14])} 28 18 34`,
  }));

  const wingsNymphRightProps = useAnimatedProps(() => ({
    d: `M 42 32 Q ${interpolate(pulse.value, [0, 1], [48, 50])} 28 46 34`,
  }));

  const wingsEmergingLeftProps = useAnimatedProps(() => ({
    d: `M 24 28 Q ${interpolate(pulse.value, [0, 1], [10, 8])} ${interpolate(pulse.value, [0, 1], [20, 18])} ${interpolate(pulse.value, [0, 1], [12, 10])} ${interpolate(pulse.value, [0, 1], [36, 38])} Q 14 32 24 32`,
  }));

  // Simplified version of the complex path animation for flight to keep it performant
  const wingsFlightLeftProps = useAnimatedProps(() => ({
    d: `M 24 26 Q ${interpolate(wings.value, [0, 1], [6, 4])} ${interpolate(wings.value, [0, 1], [14, 12])} ${interpolate(wings.value, [0, 1], [4, 2])} ${interpolate(wings.value, [0, 1], [34, 36])} Q 8 28 24 30`,
  }));

  const wingsFlightRightProps = useAnimatedProps(() => ({
    d: `M 40 26 Q ${interpolate(wings.value, [0, 1], [58, 60])} ${interpolate(wings.value, [0, 1], [14, 12])} ${interpolate(wings.value, [0, 1], [60, 62])} ${interpolate(wings.value, [0, 1], [34, 36])} Q 56 28 40 30`,
  }));

  const flightGroupProps = useAnimatedProps(() => ({
    translateY: interpolate(flight.value, [0, 1], [0, -4]),
  }));

  return (
    <View style={styles.container}>
      <Svg
        viewBox="0 0 64 64"
        style={styles.svg}
      >
        {stage === 0 && (
          <G>
            <AnimatedEllipse
              cx="32"
              cy="40"
              rx="8"
              animatedProps={bodyPulseProps}
              fill={color}
              fillOpacity={0.8}
            />
            <Circle cx="32" cy="28" r="6" fill={color} fillOpacity={0.9} />
            <Circle cx="30" cy="26" r={1.5} fill={theme.text} />
            <Circle cx="34" cy="26" r={1.5} fill={theme.text} />
          </G>
        )}

        {stage === 1 && (
          <G>
            <AnimatedEllipse
              cx="32"
              cy="38"
              rx="10"
              animatedProps={bodyNymphProps}
              fill={color}
              fillOpacity={0.8}
            />
            <Circle cx="32" cy="24" r="7" fill={color} fillOpacity={0.9} />
            <Circle cx="30" cy="22" r={2} fill={theme.text} />
            <Circle cx="34" cy="22" r={2} fill={theme.text} />
            <AnimatedPath
              animatedProps={wingsNymphLeftProps}
              fill={color}
              fillOpacity={0.4}
            />
            <AnimatedPath
              animatedProps={wingsNymphRightProps}
              fill={color}
              fillOpacity={0.4}
            />
          </G>
        )}

        {stage === 2 && (
          <G>
            <Ellipse
              cx="32"
              cy="36"
              rx="8"
              ry="16"
              fill={color}
              fillOpacity={0.9}
            />
            <Circle cx="32" cy="22" r="6" fill={color} />
            <Circle cx="30" cy="20" r={1.5} fill={theme.text} />
            <Circle cx="34" cy="20" r={1.5} fill={theme.text} />
            <AnimatedPath
              animatedProps={wingsEmergingLeftProps}
              fill={color}
              fillOpacity={0.5}
            />
            {/* Mirroring wings for others would follow same pattern */}
          </G>
        )}

        {stage === 3 && (
          <AnimatedG animatedProps={flightGroupProps}>
            <AnimatedPath
              animatedProps={wingsFlightLeftProps}
              fill={color}
              fillOpacity={0.6}
            />
            <AnimatedPath
              animatedProps={wingsFlightRightProps}
              fill={color}
              fillOpacity={0.6}
            />
            <Ellipse cx="32" cy="34" rx="6" ry="14" fill={color} fillOpacity={0.9} />
            <Circle cx="32" cy="22" r="5" fill={color} />
            <Circle cx="30" cy="20" r={1.5} fill={theme.text} />
            <Circle cx="34" cy="20" r={1.5} fill={theme.text} />
            {/* Tail lines would go here */}
          </AnimatedG>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});
