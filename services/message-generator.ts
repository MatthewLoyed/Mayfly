import { getRandomMessage, getMoodForContext, type MessageContext } from '@/constants/messages';
import { type CharacterMood } from '@/types/character';

export interface MessageContextData {
  habitStreak?: number;
  completedTodos?: number;
  totalTodos?: number;
  isFirstCompletion?: boolean;
  daysSinceLastCompletion?: number;
}

/**
 * Generate context-aware message based on user action and state
 */
export function generateMessage(
  context: MessageContext,
  data?: MessageContextData
): { message: string; mood: CharacterMood } {
  let message = getRandomMessage(context);
  const mood = getMoodForContext(context);

  // Customize message based on data
  if (context === 'streak_milestone' && data?.habitStreak) {
    const streak = data.habitStreak;
    if (streak === 7) {
      message = "A full week! That's consistency!";
    } else if (streak === 30) {
      message = "30 days! You've built something real!";
    } else if (streak === 100) {
      message = "100 days! This is what steady progress looks like!";
    }
  }

  if (context === 'all_todos_done' && data?.completedTodos) {
    message = `All ${data.completedTodos} done! You can't do everything, but you did what mattered!`;
  }

  return { message, mood };
}

/**
 * Get appropriate message context for habit completion
 */
export function getHabitCompletionContext(data?: MessageContextData): MessageContext {
  if (data?.isFirstCompletion) {
    return 'first_completion';
  }
  
  if (data?.habitStreak && data.habitStreak >= 3 && data.habitStreak % 5 === 0) {
    return 'streak_milestone';
  }
  
  return 'habit_completion';
}

/**
 * Get appropriate message context for todo completion
 */
export function getTodoCompletionContext(
  completedTodos: number,
  totalTodos: number
): MessageContext {
  if (completedTodos === totalTodos && totalTodos > 0) {
    return 'all_todos_done';
  }
  
  return 'todo_completion';
}

