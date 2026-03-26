import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { type Todo } from "@/types/todo";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
  Pressable,
  Animated as RNAnimated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { HapticType, TactileButton } from "../ui/TactileButton";


interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  onStartDrag?: () => void;
  onDelete?: () => void;
  drag?: () => void;
  isActive?: boolean;
}

/**
 * Individual todo item with circular checkbox
 */
export function TodoItem({
  todo,
  onToggle,
  onPress,
  onLongPress,
  isActive,
  drag,
  onDelete,
}: TodoItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const scale = useSharedValue(todo.completed ? 1 : 0);
  const containerOpacity = useSharedValue(todo.completed ? 0.5 : 1);
  const containerScale = useSharedValue(isActive ? 1.02 : 1);
  const checkboxScale = useSharedValue(1);
  const textScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(todo.completed ? 1 : 0, {
      mass: 0.5,
      stiffness: 150,
      damping: 15,
    });
    containerOpacity.value = withTiming(todo.completed ? 0.5 : 1, {
      duration: 200,
    });
  }, [todo.completed]);

  useEffect(() => {
    containerScale.value = withSpring(isActive ? 1.02 : 1, {
      stiffness: 500,
      damping: 30,
      mass: 0.2,
    });
  }, [isActive]);

  const animatedCheckmarkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: scale.value,
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
      transform: [{ scale: containerScale.value }],
    };
  });

  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  const handleToggle = async () => {
    // Standardize haptics based on project rules
    try {
      if (todo.completed) {
        // Unmarking - light tap
        await Haptics.selectionAsync();
      } else {
        // Completing - impact medium
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e) {}
    onToggle();
  };

  const handleDelete = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    if (onDelete) onDelete();
  };

  const renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.deleteActionContainer}>
        <RNAnimated.View
          style={[styles.deleteAction, { transform: [{ scale }] }]}
        >
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteActionButton}
          >
            <IconSymbol name="trash" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </RNAnimated.View>
      </View>
    );
  };


  return (
    <Swipeable
      renderRightActions={onDelete ? renderRightActions : undefined}
      friction={1}
      overshootRight={false}
      activeOffsetX={[-10, 10]}
      failOffsetY={[-5, 5]}
      enableTrackpadTwoFingerGesture
    >
      <Animated.View
        style={[
          styles.container,
          todo.priority && styles.priorityContainer,
          containerAnimatedStyle,
        ]}
      >
        <View style={styles.content}>
          {/* Circular checkbox */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              todo.completed ? "Mark as not completed" : "Mark as completed"
            }
            onPress={handleToggle}
            onPressIn={() => {
              checkboxScale.value = withSpring(0.92);
              Haptics.selectionAsync();
            }}
            onPressOut={() => {
              checkboxScale.value = withSpring(1);
            }}
          >
            <Animated.View
              style={[
                styles.checkbox,
                checkboxAnimatedStyle,
                {
                  backgroundColor: todo.completed
                    ? colors.habitComplete
                    : "transparent",
                  borderColor: todo.completed
                    ? colors.habitComplete
                    : colors.habitStroke,
                },
              ]}
            >
              {todo.completed && (
                <Animated.Text
                  style={[
                    styles.checkmark,
                    { color: "#FFFFFF" },
                    animatedCheckmarkStyle,
                  ]}
                >
                  ✓
                </Animated.Text>
              )}
            </Animated.View>
          </Pressable>

          <Pressable
            style={styles.textContainer}
            onPress={onPress}
            onLongPress={drag}
            delayLongPress={250}
            onPressIn={() => {
              textScale.value = withSpring(0.98);
            }}
            onPressOut={() => {
              textScale.value = withSpring(1);
            }}
          >
            <Animated.View style={textAnimatedStyle}>
              <ThemedText
                style={[
                  styles.text,
                  todo.completed && styles.completedText,
                  todo.priority && styles.priorityText,
                ]}
                numberOfLines={2}
              >
                {todo.text}
              </ThemedText>

              {(todo.dueAt || todo.estimatedMinutes != null) && (
                <View style={styles.metaRow}>
                  {todo.dueAt && (
                    <View style={styles.metaPill}>
                      <ThemedText style={styles.metaPillText}>
                        {format(new Date(todo.dueAt), "p")}
                      </ThemedText>
                    </View>
                  )}
                  {typeof todo.estimatedMinutes === "number" && (
                    <View
                      style={[
                        styles.metaPill,
                        (todo.estimatedMinutes <= 5 && styles.metaGreen) ||
                        (todo.estimatedMinutes > 60 && styles.metaRed) ||
                        (todo.estimatedMinutes >= 15 &&
                          todo.estimatedMinutes <= 60 &&
                          styles.metaOrange) ||
                        null,
                      ]}
                    >
                      <ThemedText style={styles.metaPillText}>
                        {todo.estimatedMinutes}m
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </Animated.View>
          </Pressable>

          {/* Priority indicator */}
          {todo.priority && !todo.completed && (
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <ThemedText
                style={styles.priorityBadgeText}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                !
              </ThemedText>
            </View>
          )}

          {/* Subtle Delete Button for completed tasks */}
          {onDelete && (
            <Animated.View 
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.deleteButtonContainer}
            >
              <TactileButton
                onPress={handleDelete}
                style={[
                  styles.subtleDeleteButton,
                  { opacity: todo.completed ? 0.6 : 0.2 }
                ]}
                hapticType={HapticType.ImpactMedium}
              >
                <IconSymbol name="xmark" size={14} color={colors.textSecondary} />
              </TactileButton>
            </Animated.View>
          )}
        </View>

      </Animated.View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  priorityContainer: {
    backgroundColor: "rgba(108, 92, 231, 0.1)", // Light purple background
  },
  activeContainer: {
    elevation: 4,
    backgroundColor: "#2D3436", // Explicit background for dragged item
  },
  completedContainer: {
    // Opacity handled by animated style
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  priorityText: {
    fontWeight: "600",
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    alignItems: "center",
  },
  metaPill: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  metaPillText: {
    fontSize: 12,
  },
  metaGreen: {
    borderColor: "#2ecc71",
  },
  metaOrange: {
    borderColor: "#f39c12",
  },
  metaRed: {
    borderColor: "#e74c3c",
  },
  deleteActionContainer: {
    marginVertical: 4,
    justifyContent: "center",
    alignItems: "flex-end",
    width: 80,
    backgroundColor: "#ff4757",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  deleteActionButton: {
    padding: 16,
  },
  deleteButtonContainer: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
  subtleDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
