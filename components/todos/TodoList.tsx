import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type Todo } from '@/types/todo';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { AddTodoForm } from './AddTodoForm';
import { TodoDetailsModal } from './TodoDetailsModal';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (text: string, priority: boolean) => void;
  emptyMessage?: string;
  onSaveDetails?: (todoId: string, details: { dueAt: string | null; estimatedMinutes: number | null }) => void | Promise<void>;
  onDeleteTodo?: (todoId: string) => void;
}

/**
 * Scrollable list of todos with add form
 */
export function TodoList({
  todos,
  onToggleTodo,
  onAddTodo,
  emptyMessage,
  onSaveDetails,
  onDeleteTodo,
}: TodoListProps) {
  const [showCompleted] = useState(true);
  const [localTodos, setLocalTodos] = useState<Todo[]>(todos);
  const [selected, setSelected] = useState<Todo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const emptyPulse = useRef(new Animated.Value(0.6)).current;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    setLocalTodos(todos);
  }, [todos]);

  const visibleTodos = useMemo(() => {
    return showCompleted ? localTodos : localTodos.filter((t) => !t.completed);
  }, [localTodos, showCompleted]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  useEffect(() => {
    if (visibleTodos.length === 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(emptyPulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(emptyPulse, { toValue: 0.6, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [visibleTodos.length, emptyPulse]);

  const handleAddTodo = (text: string, priority: boolean) => {
    onAddTodo(text, priority);
    setIsAdding(false);
  };

  return (
    <View style={styles.container}>
      {visibleTodos.length === 0 ? (
        <Animated.View style={[styles.emptyContainer, { opacity: emptyPulse }]}>
          <ThemedText type="subtitle" style={styles.emptyText}>
            {emptyMessage || "No todos yet. Add one to get started!"}
          </ThemedText>
        </Animated.View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={visibleTodos}
          keyExtractor={(item: Todo) => item.id}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggle={() => onToggleTodo(item.id)}
              onPress={() => {
                setSelected(item);
                setShowDetails(true);
              }}
              onLongPress={undefined}
              onStartDrag={() => { }}
              onDelete={() => onDeleteTodo && onDeleteTodo(item.id)}
              isActive={false}
            />
          )}
        />
      )}

      {totalCount > 0 && (
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            {completedCount} of {totalCount} completed
          </ThemedText>
        </ThemedView>
      )}

      {/* Floating add button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsAdding(true)}
        accessibilityRole="button"
        accessibilityLabel="Add Todo"
      >
        <IconSymbol name="plus" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal for adding todo */}
      <Modal
        visible={isAdding}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAdding(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={() => setIsAdding(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <AddTodoForm onSubmit={handleAddTodo} onCancel={() => setIsAdding(false)} />
          </View>
        </View>
      </Modal>

      {/* Details modal - save handled by parent screen */}
      <TodoDetailsModal
        visible={showDetails}
        todo={selected}
        onClose={() => setShowDetails(false)}
        onSave={async (details) => {
          if (selected && onSaveDetails) {
            await onSaveDetails(selected.id, details);
            // Optimistically reflect details without waiting for parent refresh
            setLocalTodos((prev) =>
              prev.map((t) =>
                t.id === selected.id
                  ? { ...t, dueAt: details.dueAt, estimatedMinutes: details.estimatedMinutes }
                  : t
              )
            );
          }
          setShowDetails(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

