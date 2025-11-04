export interface Habit {
  id: string;
  name: string;
  color?: string;
  icon?: string; // Ionicons icon name
  streak: number;
  lastCompletedDate?: string; // ISO date
  completedToday: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedDate: string; // ISO date
  createdAt: string;
}

