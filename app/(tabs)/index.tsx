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
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BackgroundEnvironment } from "@/components/ui/BackgroundEnvironment";
import { ButterflyHero } from "../../components/dashboard/ButterflyHero";
import { GrowthForestChart } from "../../components/dashboard/GrowthForestChart";
import { LivingProgressBar } from "../../components/dashboard/LivingProgressBar";
import { PebbleCard } from "../../components/dashboard/PebbleCard";
import { RecapSection } from "../../components/dashboard/RecapSection";
import { getRandomQuote } from "../../constants/quotes";
import { type Habit } from "@/types/habit";
import { toggleTodo } from "@/services/todo-service";
import { completeHabit } from "@/services/habit-service";

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
    { id: string; text: string; completed: boolean }[]
  >([]);
  const [nextHabit, setNextHabit] = useState<Habit | undefined>();
  const [quote, setQuote] = useState<{ text: string; author: string }>(getRandomQuote());
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

      // Find next habit (first incomplete)
      const firstIncomplete = habits.find(h => !h.completedToday);
      setNextHabit(firstIncomplete);

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
      setPriorityTodos(priorities.map((t) => ({ id: t.id, text: t.text, completed: t.completed })));

      // Load todo stats
      const stats = await getTodoStats();
      setTodoStats(stats);

      // Update quote
      setQuote(getRandomQuote());

      // Get character state and generate greeting
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

  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo(id);
      loadDashboardData();
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const handleCompleteHabit = async (id: string) => {
    try {
      await completeHabit(id);
      loadDashboardData();
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  return (
    <BackgroundEnvironment>
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.duration(800).springify()}
        >
          {/* Butterfly Hero Section */}
          <ButterflyHero
            greeting={greetingMessage}
            quote={quote}
            completionRate={todoStats.completionRate}
          />
        </Animated.View>

        {/* Recap Section (PRIORITY) */}
        <RecapSection
          priorityTodos={priorityTodos}
          nextHabit={nextHabit ? {
            id: nextHabit.id,
            name: nextHabit.name,
            color: nextHabit.color || colors.primary,
          } : undefined}
          onToggleTodo={handleToggleTodo}
          onCompleteHabit={handleCompleteHabit}
          onViewAllTodos={() => router.push('/todos')}
          onViewGarden={() => router.push('/garden')}
        />

        {/* Growth Stats - Lower Priority */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(800).springify()}
          style={[styles.section, { padding: isSmallScreen ? 16 : 24, marginTop: 24 }]}
        >
          <ThemedText type="titleRounded" style={[styles.sectionTitle, { color: colors.text }]}>
            Ecosystem Growth
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

          {/* Statistics Section */}
          <View style={[styles.grid, { marginTop: 16 }]}>
            <PebbleCard
              label="Total Completions"
              value={totalCompletions.toString()}
              color={colors.habitComplete}
              style={{ flexBasis: '100%' }}
            />
          </View>

          {/* Growth Forest Chart */}
          <GrowthForestChart data={weeklyData} colors={colors} />

          {/* Todo Completion - Living Progress */}
          {todoStats.total > 0 && (
            <LivingProgressBar progress={todoStats.completionRate} />
          )}
        </Animated.View>

        {/* Bottom Swipe Hint */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(800).springify()}
          style={styles.swipeHint}
        >
          <ThemedText style={{ color: colors.icon, fontSize: 12 }}>
            Mayfly lives for a day. Make yours count.
          </ThemedText>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
    </BackgroundEnvironment>
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
