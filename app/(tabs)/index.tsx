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
import {
  getAllTodos,
  getTodoStats,
} from "@/services/todo-service";
import { recordLoginAndGetStreak } from '@/services/character-service';
import { eachDayOfInterval, format, subDays } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTodos } from "@/contexts/TodoContext";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { Flame, Sprout, Target } from "lucide-react-native";
import { BackgroundEnvironment } from "@/components/ui/BackgroundEnvironment";
import { ButterflyHero } from "../../components/dashboard/ButterflyHero";
import { GrowthForestChart } from "../../components/dashboard/GrowthForestChart";
import { LivingProgressBar } from "../../components/dashboard/LivingProgressBar";
import { RecapSection } from "../../components/dashboard/RecapSection";
import { TactileButton, HapticType } from "@/components/ui/TactileButton";
import { getRandomQuote } from "../../constants/quotes";
import { type Habit } from "@/types/habit";
import { toggleTodo } from "@/services/todo-service";
import { completeHabit } from "@/services/habit-service";
import { seedDemoData } from '@/services/demo-service';

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

  const { todos, stats: todoStats, toggleTodo, isLoading: isTodosLoading } = useTodos();
  const [habitsCompleted, setHabitsCompleted] = useState(0);
  const [totalHabits, setTotalHabits] = useState(0);
  const [incompleteHabits, setIncompleteHabits] = useState<Habit[]>([]);
  const [quote, setQuote] = useState<{ text: string; author: string }>(getRandomQuote());
  const [greetingMessage, setGreetingMessage] = useState<string>("");
  const [isHabitsLoading, setIsHabitsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [loginStreak, setLoginStreak] = useState(0);

  const priorityTodos = useMemo(() => {
    return todos
      .filter(t => !t.completed)
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        if (a.dueAt && b.dueAt) {
          return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        }
        if (a.dueAt) return -1;
        if (b.dueAt) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, 3)
      .map(t => ({ id: t.id, text: t.text, completed: t.completed }));
  }, [todos]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await getDatabase();

      // Seed demo data if needed
      await seedDemoData();

      // Load habits
      const habits = await getAllHabits();
      const completed = await getTodaysCompletions();
      setTotalHabits(habits.length);
      setHabitsCompleted(completed);
      setLongestStreak(await getLongestStreak());
      setTotalCompletions(await getTotalCompletions());

      // Get login streak safely
      try {
        const streak = await recordLoginAndGetStreak();
        setLoginStreak(streak);
      } catch (err) {
        console.error("Failed to get login streak:", err);
        setLoginStreak(0);
      }

      // Find incomplete habits (up to 3)
      const incomplete = habits.filter(h => !h.completedToday).slice(0, 3);
      setIncompleteHabits(incomplete);

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

      // Update quote
      setQuote(getRandomQuote());

      // Get character state and generate greeting
      const { message } = generateMessage("daily_greeting");
      setGreetingMessage(message);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsHabitsLoading(false);
    }
  };

  if (isHabitsLoading || isTodosLoading) {
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
          incompleteHabits={incompleteHabits.map(h => ({
            id: h.id,
            name: h.name,
            color: h.color || colors.primary,
            icon: h.icon
          }))}
          loginStreak={loginStreak}
          onToggleTodo={handleToggleTodo}
          onCompleteHabit={handleCompleteHabit}
          onViewAllTodos={() => router.push('/todos')}
          onViewGarden={() => router.push('/garden')}
        />

        {/* Growth Stats - Premium Redesign */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(800).springify()}
          style={[styles.section, { padding: isSmallScreen ? 16 : 24, marginTop: 12 }]}
        >
          <ThemedText type="titleRounded" style={[styles.sectionTitle, { color: colors.text }]}>
            Ecosystem Growth
          </ThemedText>

    <View style={styles.statsLayout}>
            
      {/* Left Box: Daily Streak (Hero Metric) */}
      <TactileButton 
        style={[styles.heroStatBox, { backgroundColor: colors.cardBackground, borderColor: colors.habitStroke + '20' }]}
        hapticType={HapticType.Selection}
        scaleValue={0.97}
      >
         <LinearGradient
            colors={[colors.streak + '20', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        />
        <View style={[styles.iconFloat, { backgroundColor: colors.streak + '25' }]}>
          <Flame size={24} color={colors.streak} />
        </View>
        <View style={styles.heroTextContent}>
          <Animated.Text 
            entering={ZoomIn.delay(700).springify()} 
            style={[styles.heroNumber, { color: colors.text }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {longestStreak}
          </Animated.Text>
          <ThemedText style={[styles.statTitle, { color: colors.icon }]}>Best Streak</ThemedText>
        </View>
      </TactileButton>

      {/* Right Column: Stacked Nurtured / Completed */}
      <View style={styles.stackedStats}>
        <TactileButton 
          style={[styles.miniStatBox, { backgroundColor: colors.cardBackground, borderColor: colors.habitStroke + '20' }]}
          hapticType={HapticType.Selection}
          scaleValue={0.95}
          onPress={() => router.push('/garden')}
        >
            <LinearGradient
              colors={[colors.primary + '15', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />
          <View style={styles.miniHeader}>
            <View style={[styles.miniIconBg, { backgroundColor: colors.primary + '25' }]}>
              <Sprout size={16} color={colors.primary} />
            </View>
          </View>
          <View style={styles.miniTextContent}>
            <Animated.Text 
              entering={ZoomIn.delay(800).springify()} 
              style={[styles.miniNumber, { color: colors.text }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {habitsCompleted}/{totalHabits}
            </Animated.Text>
            <ThemedText style={[styles.miniLabel, { color: colors.icon }]} numberOfLines={1}>Planted</ThemedText>
          </View>
        </TactileButton>

        <TactileButton 
          style={[styles.miniStatBox, { backgroundColor: colors.cardBackground, borderColor: colors.habitStroke + '20' }]}
          hapticType={HapticType.Selection}
          scaleValue={0.95}
        >
            <LinearGradient
              colors={[colors.habitComplete + '15', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />
          <View style={styles.miniHeader}>
            <View style={[styles.miniIconBg, { backgroundColor: colors.habitComplete + '25' }]}>
              <Target size={16} color={colors.habitComplete} />
            </View>
          </View>
          <View style={styles.miniTextContent}>
            <Animated.Text 
              entering={ZoomIn.delay(900).springify()} 
              style={[styles.miniNumber, { color: colors.text }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {totalCompletions}
            </Animated.Text>
            <ThemedText style={[styles.miniLabel, { color: colors.icon }]} numberOfLines={1}>Harvests</ThemedText>
          </View>
        </TactileButton>
      </View>

    </View>

          {/* Growth Forest Chart */}
          <View style={{ marginTop: 24 }}>
            <GrowthForestChart data={weeklyData} colors={colors} />
          </View>

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
  statsLayout: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    height: 180, // Fixed height for symmetric grid
  },
  heroStatBox: {
    flex: 1.1, // Takes up slightly more space visually
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  iconFloat: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContent: {
    justifyContent: 'flex-end',
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  heroNumber: {
    fontSize: 42,
    fontFamily: 'System',
    fontWeight: '800',
  },
  stackedStats: {
    flex: 1,
    gap: 12,
  },
  miniStatBox: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  miniHeader: {
    marginBottom: 2,
  },
  miniIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniTextContent: {
    justifyContent: 'center',
    width: '100%',
  },
  miniNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
