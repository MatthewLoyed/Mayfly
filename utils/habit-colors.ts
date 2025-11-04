/**
 * Color palette for habits - using CSS variables pattern for easy theme switching
 * Each habit gets a unique color from this palette
 */
export const HABIT_COLORS = [
  '#6C5CE7', // Soft purple
  '#00B894', // Soft green
  '#FDCB6E', // Warm yellow
  '#E17055', // Soft coral
  '#74B9FF', // Soft blue
  '#A29BFE', // Light purple
  '#00CEC9', // Turquoise
  '#FDCB6E', // Golden yellow
  '#E84393', // Pink
  '#6C5CE7', // Purple
  '#00B894', // Green
  '#FF7675', // Light coral
] as const;

/**
 * Get a color for a habit based on its index
 * Cycles through the palette if there are more habits than colors
 */
export function getHabitColor(habitIndex: number): string {
  return HABIT_COLORS[habitIndex % HABIT_COLORS.length];
}

/**
 * Get the next available color for a new habit
 * This will be used when creating a new habit
 */
export function getNextHabitColor(existingHabitCount: number): string {
  return getHabitColor(existingHabitCount);
}

