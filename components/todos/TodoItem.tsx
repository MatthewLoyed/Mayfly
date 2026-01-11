import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type Todo } from '@/types/todo';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  isActive?: boolean;
  onStartDrag?: () => void;
  onDelete?: () => void;
}

/**
 * Individual todo item with circular checkbox
 */
export function TodoItem({ todo, onToggle, onPress, onLongPress, isActive, onStartDrag, onDelete }: TodoItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleToggle = async () => {
    // Light haptic on toggle (iOS only)
    if (process.env.EXPO_OS === 'ios') {
      if (todo.completed) {
        await Haptics.selectionAsync();
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onToggle();
  };

  return (
    <View
      style={[
        styles.container,
        todo.priority && styles.priorityContainer,
        isActive && styles.activeContainer,
        todo.completed && styles.completedContainer,
      ]}
    >
      <View style={styles.content}>
        {/* Circular checkbox */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={todo.completed ? 'Mark as not completed' : 'Mark as completed'}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: todo.completed ? colors.habitComplete : 'transparent',
                borderColor: todo.completed ? colors.habitComplete : colors.habitStroke,
              },
            ]}
          >
            {todo.completed && (
              <ThemedText style={styles.checkmark} lightColor="#FFFFFF" darkColor="#FFFFFF">
                ✓
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>

        {/* Todo text */}
        <TouchableOpacity style={styles.textContainer} onPress={onPress} activeOpacity={0.7}>
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
                    {format(new Date(todo.dueAt), 'p')}
                  </ThemedText>
                </View>
              )}
              {typeof todo.estimatedMinutes === 'number' && (
                <View
                  style={[
                    styles.metaPill,
                    (todo.estimatedMinutes <= 5 && styles.metaGreen) ||
                    (todo.estimatedMinutes > 60 && styles.metaRed) ||
                    (todo.estimatedMinutes >= 15 && todo.estimatedMinutes <= 60 && styles.metaOrange) ||
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
        </TouchableOpacity>

        {/* Priority indicator */}
        {todo.priority && !todo.completed && (
          <View style={[styles.priorityBadge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.priorityBadgeText} lightColor="#FFFFFF" darkColor="#FFFFFF">
              !
            </ThemedText>
          </View>
        )}
        {/* Drag handle */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Reorder"
          onPressIn={onStartDrag}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.dragHandle}
        >
          <ThemedText style={styles.dragHandleIcon}>≡</ThemedText>
        </TouchableOpacity>

        {/* Delete button (only for completed items) */}
        {todo.completed && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Delete Todo"
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteButton}
          >
            <ThemedText style={styles.deleteButtonText}>✕</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  priorityContainer: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)', // Light purple background
  },
  activeContainer: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  completedContainer: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  priorityText: {
    fontWeight: '600',
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dragHandle: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 6,
  },
  dragHandleIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    alignItems: 'center',
  },
  metaPill: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  metaPillText: {
    fontSize: 12,
  },
  metaGreen: {
    borderColor: '#2ecc71',
  },
  metaOrange: {
    borderColor: '#f39c12',
  },
  metaRed: {
    borderColor: '#e74c3c',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c', // Red color for delete
    opacity: 0.8,
  },
});

