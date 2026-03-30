import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export enum HapticType {
  Selection = "selection",
  ImpactLight = "impactLight",
  ImpactMedium = "impactMedium",
  ImpactHeavy = "impactHeavy",
  Success = "success",
  Warning = "warning",
  Error = "error",
}

interface TactileButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  hapticType?: HapticType;
}

/**
 * A "Premium" button that scales down on press and provides haptic feedback.
 * Follows the "Tactile Interaction" rule.
 * 
 * Rule 2: 
 * - selectionAsync() for light taps/selection changes.
 * - impactAsync(ImpactFeedbackStyle.Medium) for toggles or completions.
 * - notificationAsync(NotificationFeedbackType.Success) for major completion events.
 */
export function TactileButton({
  children,
  style,
  scaleValue = 0.98,
  hapticType = HapticType.Selection,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: TactileButtonProps) {
  const scale = useSharedValue(1);

  const flattenedStyle = (style ? StyleSheet.flatten(style) : {}) as ViewStyle;

  // Layout props go to the outer Pressable
  const layoutStyle: ViewStyle = {
    flex: flattenedStyle.flex,
    flexGrow: flattenedStyle.flexGrow,
    flexShrink: flattenedStyle.flexShrink,
    flexBasis: flattenedStyle.flexBasis,
    alignSelf: flattenedStyle.alignSelf,
    margin: flattenedStyle.margin,
    marginTop: flattenedStyle.marginTop,
    marginBottom: flattenedStyle.marginBottom,
    marginLeft: flattenedStyle.marginLeft,
    marginRight: flattenedStyle.marginRight,
    marginVertical: flattenedStyle.marginVertical,
    marginHorizontal: flattenedStyle.marginHorizontal,
    position: flattenedStyle.position,
    top: flattenedStyle.top,
    bottom: flattenedStyle.bottom,
    left: flattenedStyle.left,
    right: flattenedStyle.right,
    width: flattenedStyle.width,
    height: flattenedStyle.height,
    zIndex: flattenedStyle.zIndex,
  };

  // Visual props go to the animated container
  const visualStyle: ViewStyle = {
    ...flattenedStyle,
    flex: undefined,
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    position: undefined,
    top: undefined,
    bottom: undefined,
    left: undefined,
    right: undefined,
    width: flattenedStyle.width ? "100%" : undefined,
    height: flattenedStyle.height ? "100%" : undefined,
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const triggerHaptic = async () => {
    if (Platform.OS === 'web') return; // Browser intervention guards
    try {
      switch (hapticType) {
        case HapticType.Selection:
          await Haptics.selectionAsync();
          break;
        case HapticType.ImpactLight:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case HapticType.ImpactMedium:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case HapticType.ImpactHeavy:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case HapticType.Success:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case HapticType.Warning:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case HapticType.Error:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (e) {
      // Ignore haptic errors
    }
  };

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleValue, { damping: 10, stiffness: 200 });
    triggerHaptic();
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    if (onPressOut) onPressOut(e);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={layoutStyle}
      {...props}
    >
      <Animated.View
        style={[
          visualStyle,
          animatedStyle,
          flattenedStyle.flex ? { flex: 1, alignSelf: 'stretch' } : null,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

