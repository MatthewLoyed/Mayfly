import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { completeHabit, createHabit, getAllHabits } from '@/services/habit-service';
import { initDatabase } from '@/services/database';
import { type Habit } from '@/types/habit';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ButterflyHabit } from '@/components/habits/ButterflyHabit';
import { HoldToComplete } from '@/components/habits/HoldToComplete';
import { AddHabitForm } from '@/components/habits/AddHabitForm';
import { Image } from 'expo-image';

/**
 * Butterfly Garden - Habit tracking with metamorphosis theme
 * Each habit progresses through: Egg → Caterpillar → Chrysalis → Butterfly
 */
export default function GardenScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      await initDatabase();
      const allHabits = await getAllHabits();
      setHabits(allHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      await completeHabit(habitId);
      await loadHabits(); // Reload to update streaks
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleAddHabit = async (name: string, icon?: string) => {
    try {
      const newHabit = await createHabit(name, undefined, icon);
      setHabits((prev) => [...prev, newHabit]);
      setIsAdding(false);
      await loadHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Loading garden...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Garden Background Image */}
      <Image
        source={require('@/assets/images/Garden.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
        priority="high"
      />
      
      {/* Semi-transparent overlay for better text readability */}
      <View style={styles.overlay} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Butterfly Garden
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Watch your habits transform!
          </ThemedText>
        </View>

        {isAdding && (
          <View style={styles.formContainer}>
            <AddHabitForm 
              onSubmit={handleAddHabit} 
              onCancel={() => setIsAdding(false)} 
            />
          </View>
        )}

        {habits.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyText}>
              No habits yet. Tap + to plant your first seed!
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.garden}>
            {habits.map((habit) => (
              <HoldToComplete
                key={habit.id}
                onComplete={() => handleCompleteHabit(habit.id)}
                holdDuration={800}
              >
                {(isHolding, progress) => (
                  <ButterflyHabit
                    habit={habit}
                    isHolding={isHolding}
                    progress={progress}
                  />
                )}
              </HoldToComplete>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating add button */}
      {!isAdding && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setIsAdding(true)}
          accessibilityRole="button"
          accessibilityLabel="Add Habit"
        >
          <ThemedText style={[styles.fabText, { color: '#FFFFFF' }]}>+</ThemedText>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Subtle dark overlay for text readability
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Extra space for FAB
    minHeight: '100%',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  garden: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 16,
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
  fabText: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '700',
  },
});

