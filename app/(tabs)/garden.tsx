import { AddHabitForm } from "@/components/habits/AddHabitForm";
import { ButterflyHabit } from "@/components/habits/ButterflyHabit";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { HapticType, TactileButton } from "@/components/ui/TactileButton";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDatabase } from "@/services/database";
import {
  completeHabit,
  createHabit,
  deleteHabit,
  getAllHabits,
} from "@/services/habit-service";
import { type Habit } from "@/types/habit";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { BackgroundEnvironment } from "@/components/ui/BackgroundEnvironment";

/**
 * Butterfly Garden - Habit tracking with Streaks-like theme
 */
const PADDING = 20;
const GAP = 16;
const ITEM_SIZE = 130;

export default function GardenScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Edit mode state
  const [currentPage, setCurrentPage] = useState(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollViewRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      await initDatabase();
      const allHabits = await getAllHabits();
      setHabits(allHabits);
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      await completeHabit(habitId);
      await loadHabits(); // Reload to update streaks
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to remove this habit? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              await loadHabits();
            } catch (error) {
              console.error("Error deleting habit:", error);
            }
          },
        },
      ],
    );
  };

  const handleAddHabit = async (name: string, icon?: string) => {
    try {
      const newHabit = await createHabit(name, undefined, icon);
      setHabits((prev) => [...prev, newHabit]);
      setIsAdding(false);
      await loadHabits();

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ThemedText>Loading garden...</ThemedText>
      </SafeAreaView>
    );
  }

  // --- Grid Layout Calculation ---
  // Simple fluid grid since we have fixed item sizes
  const numColumns = Math.floor(
    (width - PADDING * 2 + GAP) / (ITEM_SIZE + GAP),
  );

  const habitsPerPage = 6;
  // User asked for "Garden", let's keep the paging logic but simplify constraints.

  // Group habits into pages
  const pages: Habit[][] = [];
  for (let i = 0; i < habits.length; i += habitsPerPage) {
    pages.push(habits.slice(i, i + habitsPerPage));
  }
  if (pages.length === 0) pages.push([]);

  const pageWidth = width;

  return (
    <BackgroundEnvironment>
      <SafeAreaView style={styles.container} edges={["top"]}>

      <View style={styles.header}>
        <ThemedText type="titleRounded" style={[styles.title, { color: colors.text }]}>
          Garden
        </ThemedText>
        <ThemedText type="subtitleSerif" style={[styles.subtitle, { color: colors.textSecondary }]}>
          Nurture your habits
        </ThemedText>
      </View>

      {habits.length === 0 ? (
        <View style={styles.centerContainer}>
          <TactileButton
            onPress={() => setIsAdding(true)}
            style={styles.emptyContainer}
            hapticType={HapticType.ImpactMedium}
          >
            <IconSymbol name="plus.circle" size={64} color="#FFF" />
            <ThemedText type="subtitle" style={styles.emptyText}>
              Add a task
            </ThemedText>
          </TactileButton>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
          onMomentumScrollEnd={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentPage(page);
          }}
        >
          {pages.map((pageHabits, pageIndex) => (
            <View
              key={pageIndex}
              style={[styles.pageContainer, { width: pageWidth }]}
            >
              <View style={styles.grid}>
                {pageHabits.map((habit, habitIndex) => (
                  <Animated.View
                    key={habit.id}
                    style={styles.gridItem}
                    entering={FadeInDown.delay(habitIndex * 100).springify()}
                  >
                    <ButterflyHabit
                      habit={habit}
                      onComplete={() => handleCompleteHabit(habit.id)}
                      onDelete={() => handleDeleteHabit(habit.id)}
                      isEditing={isEditing}
                      size={ITEM_SIZE}
                    />
                  </Animated.View>
                ))}
                {/* Add dummy items to balance partial rows if needed, or justify-content start */}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Footer Controls */}
      <View style={styles.footer}>
        {pages.length > 1 && (
          <View style={styles.indicators}>
            {pages.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentPage && styles.activeDot]}
              />
            ))}
          </View>
        )}
      </View>

      <TactileButton
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsAdding(true)}
        hapticType={HapticType.ImpactMedium}
      >
        <IconSymbol name="plus" size={32} color="#FFFFFF" />
      </TactileButton>

      {/* Edit/Settings Button (Bottom Left) */}
      <TactileButton
        style={[styles.settingsFab, { backgroundColor: isEditing ? colors.tint : colors.backgroundSubtle }]}
        onPress={() => setIsEditing(!isEditing)}
        hapticType={HapticType.ImpactMedium}
      >
        <IconSymbol name={isEditing ? "checkmark" : "ellipsis.circle"} size={28} color={isEditing ? "#FFF" : colors.text} />
      </TactileButton>

      <Modal
        visible={isAdding}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAdding(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAdding(false)}>
          <View style={styles.modalBackdrop}>
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <AddHabitForm
                onSubmit={handleAddHabit}
                onCancel={() => setIsAdding(false)}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
    </BackgroundEnvironment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8, // Darken it a bit more for contrast
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)", // Darker overlay for 'Premium' feel
  },
  header: {
    height: 80, // Reduced from 100
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
  },
  title: {
    color: "white",
    fontSize: 24, // Slightly smaller
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12, // Slightly smaller
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // Content layout
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: PADDING,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignContent: "flex-start",
    gap: GAP,
    marginTop: 10, // Reduced from 20
  },
  gridItem: {
    marginBottom: 10, // Reduced from GAP (20)
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "600",
  },
  footer: {
    position: 'absolute', // Position absolute to keep it at the very bottom
    bottom: 20,
    left: 0,
    right: 0,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  indicators: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  activeDot: {
    backgroundColor: "white",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 64, // Slightly larger
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#9CAF88", // Glow based on primary (Sage)
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
  settingsFab: {
    position: 'absolute',
    left: 24,
    bottom: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)", // Darker dim
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
  },
});
