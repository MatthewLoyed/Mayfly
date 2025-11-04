import { type Habit } from '@/types/habit';
import { getNextHabitColor } from '@/utils/habit-colors';
import { differenceInDays, format, isToday, isYesterday, parseISO } from 'date-fns';
import { getDatabase } from './database';

/**
 * Create a new habit
 */
export async function createHabit(name: string, color?: string, icon?: string): Promise<Habit> {
  const db = await getDatabase();
  const id = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  // Auto-assign color if not provided
  let assignedColor = color;
  if (!assignedColor) {
    // Get existing habits count to assign the next color in sequence
    const existingHabits = await getAllHabits();
    assignedColor = getNextHabitColor(existingHabits.length);
  }
  
  await db.runAsync(
    `INSERT INTO habits (id, name, color, icon, streak, completed_today, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 0, ?, ?)`,
    [id, name, assignedColor, icon || null, now, now]
  );

  return {
    id,
    name,
    color: assignedColor,
    icon,
    streak: 0,
    completedToday: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get all habits
 */
export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDatabase();
  const rows = (await db.getAllAsync(
    'SELECT * FROM habits ORDER BY created_at ASC'
  )) as {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    streak: number;
    last_completed_date: string | null;
    completed_today: number;
    created_at: string;
    updated_at: string;
  }[];

  return rows.map((row: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    streak: number;
    last_completed_date: string | null;
    completed_today: number;
    created_at: string;
    updated_at: string;
  }) => ({
    id: row.id,
    name: row.name,
    color: row.color || undefined,
    icon: row.icon || undefined,
    streak: row.streak,
    lastCompletedDate: row.last_completed_date || undefined,
    completedToday: row.completed_today === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Complete a habit (mark as done today)
 */
export async function completeHabit(habitId: string): Promise<Habit> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Get current habit state
  const habit = (await db.getFirstAsync(
    'SELECT streak, last_completed_date, completed_today FROM habits WHERE id = ?',
    [habitId]
  )) as {
    streak: number;
    last_completed_date: string | null;
    completed_today: number;
  } | undefined;

  if (!habit) {
    throw new Error('Habit not found');
  }

  // Already completed today?
  if (habit.completed_today === 1) {
    // Return existing habit
    const allHabits = await getAllHabits();
    return allHabits.find((h) => h.id === habitId)!;
  }

  // Calculate new streak
  let newStreak = habit.streak;
  if (habit.last_completed_date) {
    const lastDate = parseISO(habit.last_completed_date);
    const daysDiff = differenceInDays(new Date(), lastDate);
    
    if (isYesterday(lastDate) || isToday(lastDate)) {
      // Continue streak
      newStreak = habit.streak + 1;
    } else if (daysDiff === 1) {
      // One day missed - reset streak to 1
      newStreak = 1;
    } else {
      // Multiple days missed - reset streak to 1
      newStreak = 1;
    }
  } else {
    // First time completing
    newStreak = 1;
  }

  // Update habit
  await db.runAsync(
    `UPDATE habits 
     SET streak = ?, 
         last_completed_date = ?, 
         completed_today = 1, 
         updated_at = ?
     WHERE id = ?`,
    [newStreak, today, now, habitId]
  );

  // Record completion
  const completionId = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.runAsync(
    `INSERT INTO habit_completions (id, habit_id, completed_date, created_at)
     VALUES (?, ?, ?, ?)`,
    [completionId, habitId, today, now]
  );

  const updatedHabit = (await db.getFirstAsync(
    'SELECT * FROM habits WHERE id = ?',
    [habitId]
  )) as {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    streak: number;
    last_completed_date: string | null;
    completed_today: number;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!updatedHabit) {
    throw new Error('Failed to update habit');
  }

  return {
    id: updatedHabit.id,
    name: updatedHabit.name,
    color: updatedHabit.color || undefined,
    icon: updatedHabit.icon || undefined,
    streak: updatedHabit.streak,
    lastCompletedDate: updatedHabit.last_completed_date || undefined,
    completedToday: true,
    createdAt: updatedHabit.created_at,
    updatedAt: updatedHabit.updated_at,
  };
}

/**
 * Get streak for a habit
 */
export async function getStreak(habitId: string): Promise<number> {
  const db = await getDatabase();
  const result = (await db.getFirstAsync(
    'SELECT streak FROM habits WHERE id = ?',
    [habitId]
  )) as { streak: number } | undefined;
  return result?.streak || 0;
}

/**
 * Get habits completed today
 */
export async function getTodaysCompletions(): Promise<number> {
  const db = await getDatabase();
  const result = (await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM habits WHERE completed_today = 1'
  )) as { count: number } | undefined;
  return result?.count || 0;
}

/**
 * Reset daily completions (should be called at midnight)
 */
export async function resetDailyCompletions(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE habits SET completed_today = 0');
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habits WHERE id = ?', [habitId]);
  // Completions will be deleted via CASCADE
}

/**
 * Update habit name or color
 */
export async function updateHabit(
  habitId: string,
  updates: { name?: string; color?: string; icon?: string }
): Promise<Habit> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  const updatesList: string[] = [];
  const values: (string | null)[] = [];
  
  if (updates.name !== undefined) {
    updatesList.push('name = ?');
    values.push(updates.name);
  }
  
  if (updates.color !== undefined) {
    updatesList.push('color = ?');
    values.push(updates.color || null);
  }
  if (updates.icon !== undefined) {
    updatesList.push('icon = ?');
    values.push(updates.icon || null);
  }
  
  updatesList.push('updated_at = ?');
  values.push(now);
  values.push(habitId);
  
  await db.runAsync(
    `UPDATE habits SET ${updatesList.join(', ')} WHERE id = ?`,
    values
  );

  const allHabits = await getAllHabits();
  const updated = allHabits.find((h) => h.id === habitId);
  
  if (!updated) {
    throw new Error('Habit not found after update');
  }
  
  return updated;
}

