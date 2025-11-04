import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { type Habit } from '@/types/habit';
import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitCircle } from './HabitCircle';
import { HoldToComplete } from './HoldToComplete';

interface HabitGridProps {
  habits: Habit[];
  onCompleteHabit: (habitId: string) => void;
  emptyMessage?: string;
  onDeleteHabit?: (habitId: string) => void;
}

const HABITS_PER_PAGE = 6; // 3 rows × 2 columns
const ROWS = 3;
const COLUMNS = 2;
const PADDING = 16;
const CIRCLE_SPACING = 16; // Space between circles

/**
 * Horizontal paginated grid layout - 6 habits per page (3 rows × 2 columns)
 * Users swipe horizontally to navigate between pages
 */
export function HabitGrid({ habits, onCompleteHabit, emptyMessage, onDeleteHabit }: HabitGridProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const availableWidth = Math.max(0, width);
  const availableHeight = Math.max(0, height - (insets.top + insets.bottom));

  const circleSizeByWidth = (availableWidth - (PADDING * 2) - CIRCLE_SPACING) / COLUMNS;
  const circleSizeByHeight = (availableHeight - (PADDING * 2) - (CIRCLE_SPACING * (ROWS - 1))) / ROWS;
  const CIRCLE_SIZE = Math.max(0, Math.min(circleSizeByWidth, circleSizeByHeight));

  const PAGE_HEIGHT = (CIRCLE_SIZE * ROWS) + (CIRCLE_SPACING * (ROWS - 1)) + (PADDING * 2);
  if (habits.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="subtitle" style={styles.emptyText}>
          {emptyMessage || "No habits yet. Add one to get started!"}
        </ThemedText>
      </ThemedView>
    );
  }

  // Group habits into pages of 6
  const pages: Habit[][] = [];
  for (let i = 0; i < habits.length; i += HABITS_PER_PAGE) {
    pages.push(habits.slice(i, i + HABITS_PER_PAGE));
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {pages.map((pageHabits, pageIndex) => (
        <View 
          key={pageIndex} 
          style={[styles.page, { width: availableWidth, height: PAGE_HEIGHT }]}
        >
          <View style={styles.grid}>
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
                    onComplete={() => onCompleteHabit(habit.id)}
                    duration={1500}
                  >
                    {({ isHolding, progress }) => (
                      <HabitCircle
                        habit={habit}
                        size={CIRCLE_SIZE}
                        isHolding={isHolding}
                        progress={progress}
                        onDelete={onDeleteHabit}
                        noMargin={true}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    // No padding needed - each page handles its own layout
  },
  page: {
    alignItems: 'flex-start',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
