import { WeeksCharacter } from '@/components/character/WeeksCharacter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCharacterState } from '@/services/character-service';
import { initDatabase } from '@/services/database';
import { getAllHabits, getTodaysCompletions } from '@/services/habit-service';
import { generateMessage } from '@/services/message-generator';
import { getPriorityTodos } from '@/services/todo-service';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Dashboard screen with Weeks character and today's stats
 */
export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [habitsCompleted, setHabitsCompleted] = useState(0);
  const [totalHabits, setTotalHabits] = useState(0);
  const [priorityTodos, setPriorityTodos] = useState<{ id: string; text: string }[]>([]);
  const [greetingMessage, setGreetingMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await initDatabase();
      
      // Load habits
      const habits = await getAllHabits();
      const completed = await getTodaysCompletions();
      setTotalHabits(habits.length);
      setHabitsCompleted(completed);
      
      // Load priority todos
      const priorities = await getPriorityTodos();
      setPriorityTodos(priorities.map((t) => ({ id: t.id, text: t.text })));
      
      // Get character state and generate greeting
      const characterState = await getCharacterState();
      const { message } = generateMessage('daily_greeting');
      setGreetingMessage(message);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Weeks character */}
        <View style={styles.characterSection}>
          <WeeksCharacter size={100} mood="happy" animated={true} />
          <ThemedText type="subtitle" style={styles.greeting}>
            {greetingMessage}
          </ThemedText>
        </View>

        {/* Today's stats */}
        <ThemedView style={styles.statsSection}>
          <ThemedText type="title" style={styles.statsTitle}>
            Today
          </ThemedText>
          
          <View style={styles.statCard}>
            <ThemedText type="defaultSemiBold" style={styles.statLabel}>
              Habits Completed
            </ThemedText>
            <ThemedText type="title" style={[styles.statValue, { color: colors.habitComplete }]}>
              {habitsCompleted} / {totalHabits}
            </ThemedText>
          </View>

          {priorityTodos.length > 0 && (
            <View style={styles.prioritySection}>
              <ThemedText type="defaultSemiBold" style={styles.priorityTitle}>
                Top {priorityTodos.length} Priorities
              </ThemedText>
              {priorityTodos.map((todo) => (
                <View key={todo.id} style={styles.priorityItem}>
                  <ThemedText style={styles.priorityText}>• {todo.text}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Quick navigation */}
        <View style={styles.navigationSection}>
          <AnimatedNavButton
            backgroundColor={colors.primary}
            label="View Habits"
            onPress={() => router.push('/(tabs)/habits')}
          />
          <AnimatedNavButton
            backgroundColor={colors.secondary}
            label="View Todos"
            onPress={() => router.push('/(tabs)/todos')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  characterSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    marginTop: 16,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  statsTitle: {
    marginBottom: 16,
  },
  statCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.1)', // Light purple background
  },
  statLabel: {
    marginBottom: 8,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  prioritySection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
  },
  priorityTitle: {
    marginBottom: 12,
    opacity: 0.8,
  },
  priorityItem: {
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 16,
  },
  navigationSection: {
    flexDirection: 'row',
    gap: 12,
  },
});

function AnimatedNavButton({ backgroundColor, label, onPress }: { backgroundColor: string; label: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);

  const handleIn = () => {
    Animated.timing(scale, { toValue: 0.98, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };
  const handleOut = () => {
    Animated.timing(scale, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handleIn}
      onPressOut={handleOut}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          shadowColor: '#000',
          shadowOpacity: hovered ? 0.15 : 0.08,
          shadowRadius: hovered ? 10 : 6,
          shadowOffset: { width: 0, height: hovered ? 4 : 2 },
          elevation: hovered ? 3 : 1,
        }}
      >
        <ThemedText style={{ fontSize: 16, fontWeight: '600' }} lightColor="#FFFFFF" darkColor="#FFFFFF">
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

