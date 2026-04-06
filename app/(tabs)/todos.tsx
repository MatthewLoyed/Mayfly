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
import { useTodos } from '@/contexts/TodoContext';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundEnvironment } from '@/components/ui/BackgroundEnvironment';

/**
 * Todo list screen
 */
export default function TodosScreen() {
  const { 
    todos, 
    isLoading, 
    addTodo, 
    toggleTodo: toggleTodoContext, 
    deleteTodo: deleteTodoContext, 
    updateTodoDetails: updateTodoDetailsContext,
    refreshTodos 
  } = useTodos();
  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleSaveDetails = async (
    todoId: string,
    details: { dueAt: string | null; estimatedMinutes: number | null }
  ) => {
    try {
      await updateTodoDetailsContext(todoId, details);
    } catch (e) {
      console.error('Error updating todo details:', e);
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      // Get current state before toggling
      const currentTodo = todos.find((t) => t.id === todoId);
      const wasCompleted = currentTodo?.completed ?? false;

      const updatedTodo = await toggleTodoContext(todoId);

      // Only show message if we're completing a todo (not unchecking it)
      if (!wasCompleted && updatedTodo.completed) {
        // Fetch fresh stats for the message
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
      await addTodo(text, priority);
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
      await deleteTodoContext(todoId);
    } catch (e) {
      console.error('Failed to delete todo', e);
    }
  };

  return (
    <BackgroundEnvironment>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="titleRounded" style={{ color: colors.text }}>My Tasks</ThemedText>
          </View>
          <TodoList
            todos={todos}
            onToggleTodo={handleToggleTodo}
            onAddTodo={handleAddTodo}
            onSaveDetails={handleSaveDetails}
            onDeleteTodo={handleDeleteTodo}
            onRefresh={refreshTodos}
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
        </View>
      </SafeAreaView>
    </BackgroundEnvironment>
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

