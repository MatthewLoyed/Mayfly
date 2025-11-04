import { CharacterMessage } from '@/components/character/CharacterMessage';
import { HabitGrid } from '@/components/habits/HabitGrid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { completeHabit, createHabit, deleteHabit, getAllHabits, getTodaysCompletions } from '@/services/habit-service';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddHabitForm } from '@/components/habits/AddHabitForm';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateCharacterState } from '@/services/character-service';
import { initDatabase } from '@/services/database';
import { generateMessage, getHabitCompletionContext } from '@/services/message-generator';
import { type Habit } from '@/types/habit';

/**
 * Habit tracking screen with circles and hold-to-complete
 */
export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      await initDatabase();
      const allHabits = await getAllHabits();
      console.log('[Habits] Loaded habits count:', allHabits.length);
      setHabits(allHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      // Complete habit and get the updated habit object directly
      const updatedHabit = await completeHabit(habitId);
      
      // Reload habits to update the UI
      await loadHabits();
      
      const todaysCompletions = await getTodaysCompletions();
      
      // Generate message using the updated habit data
      const context = getHabitCompletionContext({
        habitStreak: updatedHabit.streak,
        isFirstCompletion: updatedHabit.streak === 1,
      });
      const { message: msg, mood } = generateMessage(context, {
        habitStreak: updatedHabit.streak,
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
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleAddHabit = async (name: string, icon?: string) => {
    try {
      console.log('[Habits] Creating habit with name:', name);
      const newHabit = await createHabit(name, undefined, icon);
      console.log('[Habits] Created habit id:', newHabit.id);
      // Optimistically update UI (append so earliest stays top-left)
      setHabits((prev) => [...prev, newHabit]);
      setIsAdding(false);
      // Sync from DB to ensure consistency
      await loadHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      await loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.content}>
        <HabitGrid
          habits={habits}
          onCompleteHabit={handleCompleteHabit}
          emptyMessage="No habits yet! Tap + to add your first habit."
          onDeleteHabit={handleDeleteHabit}
        />
        
        {isAdding && (
          <AddHabitForm onSubmit={handleAddHabit} onCancel={() => setIsAdding(false)} />
        )}

        {/* Floating add button */}
        {!isAdding && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={() => setIsAdding(true)}
            accessibilityRole="button"
            accessibilityLabel="Add Habit"
          >
            <ThemedText style={styles.fabText} lightColor="#FFFFFF" darkColor="#FFFFFF">+</ThemedText>
          </TouchableOpacity>
        )}

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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fabText: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '700',
  },
});

