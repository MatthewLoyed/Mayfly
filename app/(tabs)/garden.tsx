import { AddHabitForm } from '@/components/habits/AddHabitForm';
import { ButterflyHabit } from '@/components/habits/ButterflyHabit';
import { HoldToComplete } from '@/components/habits/HoldToComplete';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/services/database';
import { completeHabit, createHabit, getAllHabits } from '@/services/habit-service';
import { type Habit } from '@/types/habit';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Butterfly Garden - Habit tracking with metamorphosis theme
 * Each habit progresses through: Egg → Caterpillar → Chrysalis → Butterfly
 */
const HABITS_PER_PAGE = 6; // 3 rows × 2 columns
const ROWS = 3;
const COLUMNS = 2;
const PADDING = 16;
const CIRCLE_SPACING = 16; // Space between circles

export default function GardenScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
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
      const previousHabitCount = habits.length;
      setHabits((prev) => [...prev, newHabit]);
      setIsAdding(false);
      await loadHabits();

      // Auto-scroll to new page if habit starts a new page
      const newHabitCount = previousHabitCount + 1;
      if (newHabitCount > HABITS_PER_PAGE) {
        const newPageIndex = Math.floor((newHabitCount - 1) / HABITS_PER_PAGE);
        // Use setTimeout to ensure the ScrollView has updated with new content
        setTimeout(() => {
          const scrollWidth = Math.max(0, width);
          scrollViewRef.current?.scrollTo({
            x: newPageIndex * scrollWidth,
            animated: true,
          });
          setCurrentPage(newPageIndex);
        }, 100);
      }
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

  // Calculate dynamic sizing for butterfly habits
  const availableWidth = Math.max(0, width);
  const availableHeight = Math.max(0, height - (insets.top + insets.bottom));

  // Reserve space for header
  const HEADER_HEIGHT = 120;
  const usableHeight = availableHeight - HEADER_HEIGHT;

  const circleSizeByWidth = (availableWidth - (PADDING * 2) - CIRCLE_SPACING) / COLUMNS;
  const circleSizeByHeight = (usableHeight - (PADDING * 2) - (CIRCLE_SPACING * (ROWS - 1))) / ROWS;
  const CIRCLE_SIZE = Math.max(0, Math.min(circleSizeByWidth, circleSizeByHeight));

  const PAGE_HEIGHT = (CIRCLE_SIZE * ROWS) + (CIRCLE_SPACING * (ROWS - 1)) + (PADDING * 2);

  // Group habits into pages of 6
  const pages: Habit[][] = [];
  for (let i = 0; i < habits.length; i += HABITS_PER_PAGE) {
    pages.push(habits.slice(i, i + HABITS_PER_PAGE));
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

      {/* Fixed header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Butterfly Garden
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Watch your habits transform!
        </ThemedText>
      </View>

      {/* Horizontal paginated grid */}
      {habits.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={styles.emptyText}>
            No habits yet. Tap + to plant your first seed!
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.gridContainer}
            contentContainerStyle={styles.gridContentContainer}
            scrollEnabled={true}
            directionalLockEnabled={true}
            alwaysBounceHorizontal={true}
            bounces={true}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const pageIndex = Math.round(event.nativeEvent.contentOffset.x / availableWidth);
              setCurrentPage(Math.max(0, Math.min(pageIndex, pages.length - 1)));
            }}
            onScroll={(event) => {
              // Update during scroll for more responsive indicators
              const pageIndex = Math.round(event.nativeEvent.contentOffset.x / availableWidth);
              const clampedPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
              if (clampedPage !== currentPage) {
                setCurrentPage(clampedPage);
              }
            }}
            scrollEventThrottle={16}
          >
            {pages.map((pageHabits, pageIndex) => (
              <View
                key={pageIndex}
                style={[styles.page, { width: availableWidth, height: PAGE_HEIGHT }]}
              >
                <View style={[styles.grid, { width: (CIRCLE_SIZE * COLUMNS) + (CIRCLE_SPACING * (COLUMNS - 1)) }]}>
                  {pageHabits.map((habit, habitIndex) => {
                    // Calculate row and column position
                    const row = Math.floor(habitIndex / COLUMNS);
                    const col = habitIndex % COLUMNS;

                    return (
                      <View
                        key={habit.id}
                        style={[
                          styles.habitWrapper,
                          {
                            width: CIRCLE_SIZE,
                            height: CIRCLE_SIZE,
                            marginRight: col === 0 ? CIRCLE_SPACING : 0,
                            marginBottom: row < ROWS - 1 ? CIRCLE_SPACING : 0,
                          },
                        ]}
                      >
                        <HoldToComplete
                          onComplete={() => handleCompleteHabit(habit.id)}
                          duration={800}
                        >
                          {({ isHolding, progress }) => (
                            <ButterflyHabit
                              habit={habit}
                              isHolding={isHolding}
                              progress={progress}
                              size={CIRCLE_SIZE}
                            />
                          )}
                        </HoldToComplete>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Page indicators */}
          {pages.length > 1 && (
            <View style={styles.pageIndicatorContainer}>
              {pages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pageIndicator,
                    index === currentPage && styles.pageIndicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </>
      )}

      {/* Floating add button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsAdding(true)}
        accessibilityRole="button"
        accessibilityLabel="Add Habit"
      >
        <IconSymbol name="plus" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal overlay for adding habit */}
      <Modal
        visible={isAdding}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAdding(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAdding(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <AddHabitForm onSubmit={handleAddHabit} onCancel={() => setIsAdding(false)} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  gridContainer: {
    flex: 1,
    marginTop: 120, // Space for header
  },
  gridContentContainer: {
    // No padding needed - each page handles its own layout
  },
  page: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  habitWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 120,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pageIndicatorContainer: {
    position: 'absolute',
    bottom: 80, // Above the FAB button
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  pageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  pageIndicatorActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

