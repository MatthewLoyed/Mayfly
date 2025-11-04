import { WeeksCharacter } from '@/components/character/WeeksCharacter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCharacterState } from '@/services/character-service';
import { getDatabase } from '@/services/database';
import { getAllHabits, getTodaysCompletions, getLongestStreak, getTotalCompletions, getWeeklyStats } from '@/services/habit-service';
import { generateMessage } from '@/services/message-generator';
import { getPriorityTodos, getTodoStats } from '@/services/todo-service';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WeeklyDataPoint {
  date: string;
  count: number;
}

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
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [todoStats, setTodoStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await getDatabase();
      
      // Load habits
      const habits = await getAllHabits();
      const completed = await getTodaysCompletions();
      setTotalHabits(habits.length);
      setHabitsCompleted(completed);
      setLongestStreak(await getLongestStreak());
      setTotalCompletions(await getTotalCompletions());
      
      // Load weekly data
      const weeklyStats = await getWeeklyStats();
      const today = new Date();
      const sevenDaysAgo = subDays(today, 6);
      const allDays = eachDayOfInterval({ start: sevenDaysAgo, end: today });
      const dataMap = new Map(weeklyStats.map(item => [item.date, item.count]));
      const fullWeekData = allDays.map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        count: dataMap.get(format(date, 'yyyy-MM-dd')) || 0,
      }));
      setWeeklyData(fullWeekData);
      
      // Load priority todos
      const priorities = await getPriorityTodos();
      setPriorityTodos(priorities.map((t) => ({ id: t.id, text: t.text })));
      
      // Load todo stats
      const stats = await getTodoStats();
      setTodoStats(stats);
      
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
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

        {/* Stats Section */}
        <ThemedView style={styles.statsSection}>
          <ThemedText type="title" style={styles.statsTitle}>
            Statistics
          </ThemedText>

          {/* Habit Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              label="Longest Streak"
              value={longestStreak.toString()}
              color={colors.streak}
            />
            <StatCard
              label="Total Completions"
              value={totalCompletions.toString()}
              color={colors.habitComplete}
            />
          </View>

          {/* Weekly Chart */}
          {weeklyData.length > 0 && (
            <View style={styles.chartContainer}>
              <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Last 7 Days
              </ThemedText>
              <View style={styles.chart}>
                {weeklyData.map((dataPoint) => {
                  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
                  const height = maxCount > 0 ? (dataPoint.count / maxCount) * 100 : 0;
                  const date = parseISO(dataPoint.date);
                  const dayLabel = format(date, 'EEE');
                  const dayNumber = format(date, 'd');
                  
                  return (
                    <View key={dataPoint.date} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(height, dataPoint.count > 0 ? 4 : 0),
                              backgroundColor: dataPoint.count > 0 ? colors.habitComplete : colors.habitIncomplete,
                            },
                          ]}
                        />
                        <ThemedText style={styles.barValue} darkColor="#999">
                          {dataPoint.count}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.barLabel} darkColor="#666">
                        {dayLabel}
                      </ThemedText>
                      <ThemedText style={styles.barDayNumber} darkColor="#999">
                        {dayNumber}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Todo Stats */}
          {todoStats.total > 0 && (
            <View style={styles.todoStatsContainer}>
              <View style={styles.todoStatsGrid}>
                <StatCard
                  label="Total Todos"
                  value={todoStats.total.toString()}
                  color={colors.primary}
                />
                <StatCard
                  label="Completed"
                  value={todoStats.completed.toString()}
                  color={colors.habitComplete}
                />
              </View>
              <View style={styles.completionContainer}>
                <View style={styles.completionHeader}>
                  <ThemedText type="defaultSemiBold">Completion Rate</ThemedText>
                  <ThemedText type="defaultSemiBold" style={{ color: colors.habitComplete }}>
                    {todoStats.completionRate.toFixed(1)}%
                  </ThemedText>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${todoStats.completionRate}%`,
                        backgroundColor: colors.habitComplete,
                      },
                    ]}
                  />
                </View>
              </View>
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

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <ThemedView style={[styles.statCard, { borderLeftColor: color }]}>
      <ThemedText style={styles.statValue} darkColor={color}>
        {value}
      </ThemedText>
      <ThemedText style={styles.statLabel} darkColor="#999">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
    backgroundColor: 'rgba(162, 155, 254, 0.15)', // Dark mode purple background
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
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    marginBottom: 16,
    fontSize: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    width: '80%',
    minHeight: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  barDayNumber: {
    fontSize: 9,
    marginTop: 2,
  },
  todoStatsContainer: {
    marginTop: 16,
  },
  todoStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  completionContainer: {
    marginTop: 8,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(162, 155, 254, 0.15)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
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
        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

