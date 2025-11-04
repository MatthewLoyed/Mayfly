import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { reorderTodos } from '@/services/todo-service';
import { type Todo } from '@/types/todo';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { AddTodoForm } from './AddTodoForm';
import { TodoDetailsModal } from './TodoDetailsModal';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (text: string, priority: boolean) => void;
  emptyMessage?: string;
  onSaveDetails?: (todoId: string, details: { dueAt: string | null; estimatedMinutes: number | null }) => void | Promise<void>;
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
}: TodoListProps) {
  const [showCompleted] = useState(true);
  const [localTodos, setLocalTodos] = useState<Todo[]>(todos);
  const [selected, setSelected] = useState<Todo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const emptyPulse = useRef(new Animated.Value(0.6)).current;

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

  return (
    <View style={styles.container}>
      <AddTodoForm onSubmit={onAddTodo} />
      
      {visibleTodos.length === 0 ? (
        <Animated.View style={[styles.emptyContainer, { opacity: emptyPulse }] }>
          <ThemedText type="subtitle" style={styles.emptyText}>
            {emptyMessage || "No todos yet. Add one to get started!"}
          </ThemedText>
        </Animated.View>
      ) : (
        <DraggableFlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={visibleTodos}
          keyExtractor={(item: Todo) => item.id}
          // @ts-ignore activationDistance exists at runtime; typings may lag
          activationDistance={1}
          // Allow dragged item to overlap neighbors to help swapping
          // @ts-ignore dragItemOverflow exists at runtime
          dragItemOverflow
          autoscrollThreshold={30}
          onDragBegin={() => {
            console.log('[TodoList] drag begin');
          }}
          renderItem={({ item, drag, isActive }: RenderItemParams<Todo>) => (
            <TodoItem
              todo={item}
              onToggle={() => onToggleTodo(item.id)}
              onPress={() => {
                setSelected(item);
                setShowDetails(true);
              }}
              onLongPress={undefined}
              onStartDrag={drag}
              isActive={isActive}
            />
          )}
          onDragEnd={async ({ data }: { data: Todo[] }) => {
            // Since we currently show all todos, we can directly use the new order
            setLocalTodos(data);
            try {
              const reorderedIds = data.map((t) => t.id);
              await reorderTodos(reorderedIds);
            } catch (e) {
              console.warn('Failed to persist todo reorder', e);
            }
          }}
        />
      )}
      
      {totalCount > 0 && (
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            {completedCount} of {totalCount} completed
          </ThemedText>
        </ThemedView>
      )}

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
    paddingBottom: 16,
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
});

