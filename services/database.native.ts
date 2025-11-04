import * as SQLite from 'expo-sqlite';

type SQLiteDatabase = SQLite.SQLiteDatabase;
let db: SQLiteDatabase | null = null;

/**
 * Initialize SQLite database and create tables if they don't exist
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('productivity.db');
  
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      streak INTEGER DEFAULT 0,
      last_completed_date TEXT,
      completed_today INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Ensure icon column exists on older installs
  try {
    const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(habits)`);
    const hasIcon = Array.isArray(cols) && cols.some((c) => c.name === 'icon');
    if (!hasIcon) {
      await db.execAsync(`ALTER TABLE habits ADD COLUMN icon TEXT`);
    }
  } catch {}

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority INTEGER DEFAULT 0,
      order_index INTEGER,
      due_at TEXT,
      estimated_minutes INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS character_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      mood TEXT DEFAULT 'happy',
      total_interactions INTEGER DEFAULT 0,
      last_interaction_date TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Initialize character state if it doesn't exist
  const characterState = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM character_state WHERE id = 1'
  );
  
  if (!characterState) {
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO character_state (id, mood, total_interactions, updated_at) VALUES (1, ?, 0, ?)',
      ['happy', now]
    );
  }

  // Ensure todos.order_index exists (safe migration)
  try {
    const todoColumns = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info('todos')"
    );
    const hasOrderIndex = todoColumns.some((c) => c.name === 'order_index');
    if (!hasOrderIndex) {
      await db.execAsync('ALTER TABLE todos ADD COLUMN order_index INTEGER');
      // Backfill order_index based on created_at ascending
      const rows = await db.getAllAsync<{ id: string }>(
        'SELECT id FROM todos ORDER BY created_at ASC'
      );
      let idx = 0;
      for (const row of rows) {
        await db.runAsync('UPDATE todos SET order_index = ? WHERE id = ?', [idx, row.id]);
        idx += 1;
      }
    }
  } catch (e) {
    console.warn('Migration warning (order_index):', e);
  }

  // Ensure todos.due_at and estimated_minutes exist (safe migration)
  try {
    const todoColumns = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info('todos')"
    );
    const hasDueAt = todoColumns.some((c) => c.name === 'due_at');
    const hasEstimated = todoColumns.some((c) => c.name === 'estimated_minutes');
    if (!hasDueAt) {
      await db.execAsync('ALTER TABLE todos ADD COLUMN due_at TEXT');
    }
    if (!hasEstimated) {
      await db.execAsync('ALTER TABLE todos ADD COLUMN estimated_minutes INTEGER');
    }
  } catch (e) {
    console.warn('Migration warning (due_at/estimated_minutes):', e);
  }

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

