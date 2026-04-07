import { format, subDays } from 'date-fns';
import { getDatabase } from './database';
import { createHabit, getAllHabits } from './habit-service';
import { createTodo, getAllTodos, toggleTodo } from './todo-service';
import { AppIcons } from '@/constants/icons';

/**
 * Seed demo data for Growth Forest (last 7 days of completions) and Todos
 */
export async function seedDemoData(): Promise<void> {
  const db = await getDatabase();
  
  // 1. Check if we have any completions in the last 7 days
  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);
  const startDate = format(sevenDaysAgo, 'yyyy-MM-dd');
  
  const existingCompletions = (await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM habit_completions WHERE completed_date >= ?',
    [startDate]
  )) as { count: number } | undefined;

  // 1.5 Hotfix: Ensure existing icons are valid (migrating from hallucination names)
  await db.execAsync(`
    UPDATE habits SET icon = '${AppIcons.walk}' WHERE icon = 'footprints';
    UPDATE habits SET icon = '${AppIcons.water}' WHERE icon = 'droplet';
    UPDATE habits SET icon = '${AppIcons.barbell}' WHERE icon = 'dumbbell';
    UPDATE habits SET icon = '${AppIcons.book}' WHERE icon = 'book-open';
    UPDATE habits SET icon = '${AppIcons.flame}' WHERE icon = 'flame-sharp';
  `);

  // 2. Ensure we have at least 4 habits
  let habits = await getAllHabits();
  const demoHabitNames = [
    { name: 'Morning Meditation', color: '#4CAF50', icon: AppIcons.leaf },
    { name: 'Read 10 Pages', color: '#2196F3', icon: AppIcons.book },
    { name: 'Evening Walk', color: '#FF9800', icon: AppIcons.walk },
    { name: 'Drink 2L Water', color: '#03A9F4', icon: AppIcons.water }
  ];

  if (habits.length < 3) {
    for (const dh of demoHabitNames) {
      if (!habits.find(h => h.name === dh.name)) {
        await createHabit(dh.name, dh.color, dh.icon);
      }
    }
    habits = await getAllHabits();
  }

  // 3. Seed some demo todos if none exist or if we need more for the demo
  const existingTodos = await getAllTodos(true);
  if (existingTodos.length < 8) {
      const demoTodos = [
          { text: 'Finalize Honors Thesis', priority: true, completed: true },
          { text: 'Pack for symposium presentation', priority: true, completed: false },
          { text: 'Buy groceries for dinner', priority: false, completed: true },
          { text: 'Submit final project report', priority: true, completed: false },
          { text: 'Update portfolio website', priority: false, completed: false },
          { text: 'Morning Jog - 5km', priority: false, completed: true },
          { text: 'Call Grandma', priority: false, completed: false },
          { text: 'Refactor Auth Service', priority: true, completed: false },
          { text: 'Review Pull Requests', priority: false, completed: true },
          { text: 'Prepare weekly meal plan', priority: false, completed: false }
      ];
      
      for (const dt of demoTodos) {
          if (!existingTodos.find(t => t.text === dt.text)) {
              const todo = await createTodo(dt.text, dt.priority);
              if (dt.completed) {
                  await toggleTodo(todo.id);
              }
          }
      }
  }

  if (existingCompletions && existingCompletions.count > 5) {
    // Already has enough completion data for a chart
    console.log('Skipping chart seed: Data already exists, icons hotfixed');
    return;
  }

  // 4. Generate random completions for the last 14 days
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if this day already has completions
    const dayComp = (await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM habit_completions WHERE completed_date = ?',
      [dateStr]
    )) as { count: number } | undefined;
    
    if (dayComp && dayComp.count > 0) continue;

    // Pick a random number of habits to complete for this day (1 to all habits)
    // We want a varied chart, so some days have more, some less
    const isTodayDate = i === 0;
    const maxToComplete = isTodayDate ? Math.min(habits.length, 2) : habits.length;
    const numToComplete = Math.floor(Math.random() * maxToComplete) + 1;
    
    const shuffled = [...habits].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numToComplete);
    
    for (const habit of selected) {
        const compId = `demo_${Date.now()}_${i}_${habit.id.split('_').pop()}`;
        await db.runAsync(
          'INSERT INTO habit_completions (id, habit_id, completed_date, created_at) VALUES (?, ?, ?, ?)',
          [compId, habit.id, dateStr, now.toISOString()]
        );
    }
  }

  // 4. Update existing habits' state for today (if seeded)
  const todayStr = format(now, 'yyyy-MM-dd');
  const todayCompletions = (await db.getAllAsync(
    'SELECT habit_id FROM habit_completions WHERE completed_date = ?',
    [todayStr]
  )) as { habit_id: string }[];
  
  for (const comp of todayCompletions) {
    await db.runAsync(
      'UPDATE habits SET completed_today = 1, last_completed_date = ? WHERE id = ?',
      [todayStr, comp.habit_id]
    );
  }

  // (Removed duplicate todos seeding block)

  // 6. Update streaks for habits (simplified calculation for demo)
  for (const habit of habits) {
      const randomStreak = Math.floor(Math.random() * 8) + 3;
      await db.runAsync(
          'UPDATE habits SET streak = ? WHERE id = ?',
          [randomStreak, habit.id]
      );
  }

  console.log('Demo data seeding complete.');
}
