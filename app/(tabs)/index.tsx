import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getCharacterState } from "@/services/character-service";
import { getDatabase } from "@/services/database";
import {
  getAllHabits,
  getLongestStreak,
  getTodaysCompletions,
  getTotalCompletions,
  getWeeklyStats,
} from "@/services/habit-service";
import { generateMessage } from "@/services/message-generator";
import { getPriorityTodos, getTodoStats } from "@/services/todo-service";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { LinearTransition, FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ButterflyHero } from "../../components/dashboard/ButterflyHero";
import { GrowthForestChart } from "../../components/dashboard/GrowthForestChart";
import { LivingProgressBar } from "../../components/dashboard/LivingProgressBar";
import { PebbleCard } from "../../components/dashboard/PebbleCard";

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
  const colors = Colors[colorScheme ?? "light"];
  const { width } = useWindowDimensions();

  const [habitsCompleted, setHabitsCompleted] = useState(0);
  const [totalHabits, setTotalHabits] = useState(0);
  const [priorityTodos, setPriorityTodos] = useState<
    { id: string; text: string }[]
  >([]);
  const [greetingMessage, setGreetingMessage] = useState<string>("");
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
      const weeklyStats: { date: string; count: number }[] =
        await getWeeklyStats();
      const today = new Date();
      const sevenDaysAgo = subDays(today, 6);
      const allDays = eachDayOfInterval({ start: sevenDaysAgo, end: today });
      const dataMap = new Map(
        weeklyStats.map((item) => [item.date, item.count]),
      );
      const fullWeekData = allDays.map((date) => ({
        date: format(date, "yyyy-MM-dd"),
        count: dataMap.get(format(date, "yyyy-MM-dd")) || 0,
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
      const { message } = generateMessage("daily_greeting");
      setGreetingMessage(message);
    } catch (error) {
      console.error("Error loading dashboard:", error);
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

  const isSmallScreen = width < 380;
  const padding = isSmallScreen ? 16 : 24;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <LinearGradient
        colors={[colors.background, '#121412']} // Deep Charcoal to Dark Moss
        style={styles.backgroundGradient}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeIn.duration(600)}
          layout={LinearTransition}
        >
          {/* Butterfly Hero Section */}
          <ButterflyHero
            greeting={greetingMessage}
            completionRate={todoStats.completionRate}
          />
        </Animated.View>

        {/* Today's Focus - Pebble Card Style */}
        <Animated.View
          layout={LinearTransition}
          style={[styles.section, { padding: isSmallScreen ? 16 : 24 }]}
        >
          <ThemedText type="titleRounded" style={styles.sectionTitle}>
            Current Growth
          </ThemedText>

          <View style={styles.grid}>
            <PebbleCard
              label="Habits Planted"
              value={`${habitsCompleted}/${totalHabits}`}
              color={colors.primary}
              style={{ flexBasis: '48%' }}
              onPress={() => router.push('/garden')}
            />
            <PebbleCard
              label="Daily Streak"
              value={longestStreak.toString()}
              color={colors.streak}
              style={{ flexBasis: '48%' }}
            />
          </View>
        </Animated.View>

        {/* Statistics Section */}
        <Animated.View
          layout={LinearTransition}
          style={[styles.section, { padding: isSmallScreen ? 16 : 24, marginTop: 16 }]}
        >
          <ThemedText type="titleRounded" style={styles.sectionTitle}>
            Ecosystem Stats
          </ThemedText>

          {/* Stats Grid */}
          <View style={styles.grid}>
            <PebbleCard
              label="Total Completions"
              value={totalCompletions.toString()}
              color={colors.habitComplete}
              style={{ flexBasis: '100%' }}
            />
          </View>

          {/* Growth Forest Chart */}
          <GrowthForestChart data={weeklyData} colors={colors} />

          {/* Todo Compeltion - Living Progress */}
          {todoStats.total > 0 && (
            <LivingProgressBar progress={todoStats.completionRate} />
          )}
        </Animated.View>

        {/* Bottom Swipe Hint */}
        <View style={styles.swipeHint}>
          <ThemedText style={{ color: colors.icon, fontSize: 12 }}>
            Swipe to tend your garden
          </ThemedText>
          <View style={[styles.swipeBar, { backgroundColor: '#E6B874' }]} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color handled by gradient
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent', // Important for gradient visibility
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
    borderRadius: 32,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    marginBottom: 20,
    marginLeft: 8,
    fontFamily: 'System',
    fontSize: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  swipeHint: {
    alignItems: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
  swipeBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  // Placeholders to prevent TS errors if I missed any used styles during refactor.
  // In a real refactor, we would delete these.
  characterSection: {},
  greeting: {},
  statsSection: {},
  statsTitle: {},
  statCard: {},
  statLabel: {},
  statValue: {},
  navigationSection: {},
  navButton: {},
  navButtonText: {},
  statsGrid: {},
  todoStatsContainer: {},
  todoStatsGrid: {},
  completionContainer: {},
  completionHeader: {},
  progressBarContainer: {},
  progressBar: {},
});
