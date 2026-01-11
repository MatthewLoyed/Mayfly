import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Lightweight in-memory shim for web to avoid wasm requirement
type SQLiteDatabase = any;
let db: SQLiteDatabase | null = null;

/**
 * Initialize database based on platform
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  if (db) {
    return db;
  }

  if (Platform.OS !== 'web') {
    // Native SQLite implementation
    db = await SQLite.openDatabaseAsync('mayfly.db');

    // Basic migration for character_state
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT,
        streak INTEGER DEFAULT 0,
        last_completed_date TEXT,
        completed_today INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS habit_completions (
        id TEXT PRIMARY KEY NOT NULL,
        habit_id TEXT NOT NULL,
        completed_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY NOT NULL,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 0,
        order_index INTEGER,
        due_at TEXT,
        estimated_minutes INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS character_state (
        id INTEGER PRIMARY KEY DEFAULT 1,
        mood TEXT DEFAULT 'happy',
        total_interactions INTEGER DEFAULT 0,
        last_interaction_date TEXT,
        updated_at TEXT NOT NULL
      );
    `);

    // Ensure character_state exists
    const row = await db.getFirstAsync('SELECT id FROM character_state WHERE id = 1');
    if (!row) {
      const now = new Date().toISOString();
      await db.runAsync(
        'INSERT INTO character_state (id, mood, total_interactions, updated_at) VALUES (1, ?, 0, ?)',
        ['happy', now]
      );
    }

    return db;
  }

  // Web implementation - lightweight in-memory shim
  const memoryStore = {
    habits: [] as any[],
    habit_completions: [] as any[],
    todos: [] as any[],
    character_state: [{ id: 1, mood: 'happy', total_interactions: 0, last_interaction_date: null, updated_at: new Date().toISOString() }],
  };

  db = {
    execAsync: async () => { },
    runAsync: async (query: string, params: any[] = []) => {
      // Minimal in-memory handlers for todos
      if (query.startsWith('INSERT INTO habits')) {
        const [id, name, color, p4, p5, p6] = params;
        let icon: string | null = null;
        let created_at: string = p5;
        let updated_at: string = p6;
        if (typeof p6 === 'undefined') {
          created_at = p4;
          updated_at = p5;
        } else {
          icon = p4 || null;
        }
        memoryStore.habits.push({ id, name, color, icon, streak: 0, last_completed_date: null, completed_today: 0, created_at, updated_at });
        return;
      }
      if (query.startsWith('UPDATE habits')) {
        const setPart = query.split('SET')[1].split('WHERE')[0];
        const fields = setPart.split(',').map((s) => s.trim().split(' = ')[0]);
        const id = params[params.length - 1];
        const h = memoryStore.habits.find((x) => x.id === id);
        if (h) {
          for (let i = 0; i < fields.length; i++) {
            const key = fields[i];
            const value = params[i];
            if (key === 'streak') h.streak = value;
            else if (key === 'last_completed_date') h.last_completed_date = value;
            else if (key === 'completed_today') h.completed_today = value;
            else if (key === 'updated_at') h.updated_at = value;
            else if (key === 'name') h.name = value;
            else if (key === 'color') h.color = value;
            else if (key === 'icon') h.icon = value;
          }
        }
        return;
      }
      if (query.startsWith('INSERT INTO habit_completions')) {
        const [id, habit_id, completed_date, created_at] = params;
        memoryStore.habit_completions.push({ id, habit_id, completed_date, created_at });
        return;
      }
      if (query.startsWith('UPDATE habits SET completed_today = 0')) {
        memoryStore.habits.forEach((h) => (h.completed_today = 0));
        return;
      }
      if (query.startsWith('DELETE FROM habits WHERE id =')) {
        const [id] = params;
        memoryStore.habits = memoryStore.habits.filter((x) => x.id !== id);
        memoryStore.habit_completions = memoryStore.habit_completions.filter((c) => c.habit_id !== id);
        return;
      }
      if (query.startsWith('INSERT INTO todos')) {
        const [id, text, completed, priority, created_at, updated_at] = params;
        memoryStore.todos.push({ id, text, completed, priority, created_at, updated_at });
        return;
      }
      if (query.startsWith('UPDATE todos SET completed =')) {
        const [completed, updated_at, id] = params;
        const t = memoryStore.todos.find((x) => x.id === id);
        if (t) { t.completed = completed; t.updated_at = updated_at; }
        return;
      }
      if (query.startsWith('UPDATE todos SET priority =')) {
        const [priority, updated_at, id] = params;
        const t = memoryStore.todos.find((x) => x.id === id);
        if (t) { t.priority = priority; t.updated_at = updated_at; }
        return;
      }
      if (query.startsWith('UPDATE todos SET text =')) {
        const [text, updated_at, id] = params;
        const t = memoryStore.todos.find((x) => x.id === id);
        if (t) { t.text = text; t.updated_at = updated_at; }
        return;
      }
      if (query.startsWith('DELETE FROM todos WHERE id =')) {
        const [id] = params;
        memoryStore.todos = memoryStore.todos.filter((x) => x.id !== id);
        return;
      }
      if (query.startsWith('INSERT INTO character_state')) {
        const [mood, updated_at] = params;
        memoryStore.character_state[0] = { id: 1, mood, total_interactions: 0, last_interaction_date: null, updated_at };
        return;
      }
      if (query.startsWith('UPDATE character_state')) {
        const c = memoryStore.character_state[0];
        if (query.includes('total_interactions = total_interactions + 1')) {
          const [last_date, updated_at] = params;
          c.total_interactions += 1;
          c.last_interaction_date = last_date;
          c.updated_at = updated_at;
        } else {
          const [mood, updated_at] = params;
          c.mood = mood;
          c.updated_at = updated_at;
        }
        return;
      }
    },
    getFirstAsync: async (query: string, params: any[] = []) => {
      if (query.includes('FROM character_state')) return memoryStore.character_state[0];
      if (query.startsWith('SELECT streak, last_completed_date, completed_today FROM habits WHERE id =')) {
        const [id] = params;
        const h = memoryStore.habits.find((x) => x.id === id);
        return h ? { streak: h.streak, last_completed_date: h.last_completed_date, completed_today: h.completed_today } : undefined;
      }
      if (query.startsWith('SELECT * FROM habits WHERE id =')) {
        const [id] = params;
        const h = memoryStore.habits.find((x) => x.id === id);
        return h;
      }
      if (query.startsWith('SELECT COUNT(*) as count FROM habits WHERE completed_today = 1')) {
        return { count: memoryStore.habits.filter((h) => h.completed_today === 1).length } as any;
      }
      if (query.startsWith('SELECT completed FROM todos WHERE id =')) {
        const [id] = params;
        const t = memoryStore.todos.find((x) => x.id === id);
        return t ? { completed: t.completed } : undefined;
      }
      if (query.startsWith('SELECT COUNT(*) as count FROM todos WHERE priority = 1 AND completed = 0')) {
        return { count: memoryStore.todos.filter((t) => t.priority === 1 && t.completed === 0).length } as any;
      }
      if (query.startsWith('SELECT COUNT(*) as count FROM todos WHERE priority = 1 AND completed = 0 AND id !=')) {
        const [excludeId] = params;
        return { count: memoryStore.todos.filter((t) => t.priority === 1 && t.completed === 0 && t.id !== excludeId).length } as any;
      }
      return undefined;
    },
    getAllAsync: async (query: string, params: any[] = []) => {
      if (query.startsWith('SELECT * FROM habits')) {
        let rows = [...memoryStore.habits];
        if (query.includes('ORDER BY created_at DESC')) rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
        if (query.includes('ORDER BY created_at ASC')) rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
        return rows as any;
      }
      if (query.startsWith('SELECT * FROM todos')) {
        let rows = [...memoryStore.todos];
        if (query.includes('WHERE completed = 0')) rows = rows.filter((t) => t.completed === 0);
        if (query.includes('WHERE priority = 1 AND completed = 0')) rows = rows.filter((t) => t.priority === 1 && t.completed === 0);
        if (query.includes('ORDER BY priority DESC, created_at DESC')) rows.sort((a, b) => (b.priority - a.priority) || (b.created_at.localeCompare(a.created_at)));
        if (query.includes('ORDER BY created_at ASC')) rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
        if (query.includes('LIMIT 3')) rows = rows.slice(0, 3);
        return rows as any;
      }
      return [] as any[];
    },
    closeAsync: async () => { },
  } as SQLiteDatabase;

  return db;
}

/**
 * Get the database instance (initializes if needed)
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

