import { CharacterMessage } from '@/components/character/CharacterMessage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoList } from '@/components/todos/TodoList';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateCharacterState } from '@/services/character-service';
import { initDatabase } from '@/services/database';
import { generateMessage, getTodoCompletionContext } from '@/services/message-generator';
import { createTodo, deleteTodo, getAllTodos, toggleTodo, updateTodoDetails } from '@/services/todo-service';
import { type Todo } from '@/types/todo';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Todo list screen
 */
export default function TodosScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      await initDatabase();
      const allTodos = await getAllTodos(true);
      setTodos(allTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = async (
    todoId: string,
    details: { dueAt: string | null; estimatedMinutes: number | null }
  ) => {
    try {
      await updateTodoDetails(todoId, details);
      await loadTodos();
    } catch (e) {
      console.error('Error updating todo details:', e);
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      // Get current state before toggling
      const currentTodo = todos.find((t) => t.id === todoId);
      const wasCompleted = currentTodo?.completed ?? false;

      const updatedTodo = await toggleTodo(todoId);

      // Reload todos
      await loadTodos();

      // Only show message if we're completing a todo (not unchecking it)
      if (!wasCompleted && updatedTodo.completed) {
        // Check if all todos are done
        const updatedTodos = await getAllTodos(true);
        const completedCount = updatedTodos.filter((t) => t.completed).length;
        const totalCount = updatedTodos.length;

        // Generate message
        const context = getTodoCompletionContext(completedCount, totalCount);
        const { message: msg, mood } = generateMessage(context, {
          completedTodos: completedCount,
          totalTodos: totalCount,
        });

        // Update character state
        await updateCharacterState(mood);

        // Show message
        setMessage(msg);
        setShowMessage(true);

        // Auto-hide message
        setTimeout(() => {
          setShowMessage(false);
        }, 4000);
      } else if (wasCompleted && !updatedTodo.completed) {
        // Explicitly clear any active message when unchecking
        setShowMessage(false);
        setMessage(null);
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleAddTodo = async (text: string, priority: boolean) => {
    try {
      console.log('[TodosScreen] handleAddTodo', { text, priority });
      await createTodo(text, priority);
      console.log('[TodosScreen] createTodo ok');
      await loadTodos();
      console.log('[TodosScreen] loadTodos after create ok');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteTodo(todoId);
      // Removed haptics for delete as it might be too aggressive, rely on visual cue
      await loadTodos();
    } catch (e) {
      console.error('Failed to delete todo', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">My Tasks</ThemedText>
        </ThemedView>
        <TodoList
          todos={todos}
          onToggleTodo={handleToggleTodo}
          onAddTodo={handleAddTodo}
          onSaveDetails={handleSaveDetails}
          onDeleteTodo={handleDeleteTodo}
          emptyMessage="No todos yet! Add one to get started!"
        />

        {/* Character message */}
        {message && (
          <CharacterMessage
            message={message}
            visible={showMessage}
            onDismiss={() => setShowMessage(false)}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
});

