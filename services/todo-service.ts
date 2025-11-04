import { type Todo } from '@/types/todo';
import { getDatabase } from './database';

/**
 * Create a new todo
 */
export async function createTodo(text: string, priority: boolean = false): Promise<Todo> {
  const db = await getDatabase();
  const id = `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  // Check if we already have 3 priority todos
  if (priority) {
    const currentPriorities = (await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM todos WHERE priority = 1 AND completed = 0'
    )) as { count: number } | null;
    
    if (currentPriorities && currentPriorities.count >= 3) {
      // Don't allow more than 3 priorities
      priority = false;
    }
  }
  
  // Determine next order index
  const maxOrder = (await db.getFirstAsync(
    'SELECT MAX(order_index) as maxOrder FROM todos'
  )) as { maxOrder: number } | null;
  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  await db.runAsync(
    `INSERT INTO todos (id, text, completed, priority, order_index, due_at, estimated_minutes, created_at, updated_at)
     VALUES (?, ?, 0, ?, ?, NULL, NULL, ?, ?)`,
    [id, text, priority ? 1 : 0, nextOrder, now, now]
  );

  return {
    id,
    text,
    completed: false,
    priority,
    orderIndex: nextOrder,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get all todos (optionally filtered by completed status)
 */
export async function getAllTodos(showCompleted: boolean = true): Promise<Todo[]> {
  const db = await getDatabase();
  let query = 'SELECT * FROM todos';
  const params: number[] = [];
  
  if (!showCompleted) {
    query += ' WHERE completed = 0';
  }
  
  // SQLite doesn't support NULLS LAST. Emulate it via CASE for order_index
  query += ' ORDER BY completed ASC, priority DESC, (order_index IS NULL) ASC, order_index ASC, created_at DESC';
  
  const rows = (await db.getAllAsync(query, params)) as {
    id: string;
    text: string;
    completed: number;
    priority: number;
    order_index: number | null;
    due_at: string | null;
    estimated_minutes: number | null;
    created_at: string;
    updated_at: string;
  }[];

  return rows.map((row: {
    id: string;
    text: string;
    completed: number;
    priority: number;
    order_index: number | null;
    due_at: string | null;
    estimated_minutes: number | null;
    created_at: string;
    updated_at: string;
  }) => ({
    id: row.id,
    text: row.text,
    completed: row.completed === 1,
    priority: row.priority === 1,
    orderIndex: row.order_index ?? undefined,
    dueAt: row.due_at,
    estimatedMinutes: row.estimated_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Toggle todo completion
 */
export async function toggleTodo(todoId: string): Promise<Todo> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  // Get current state
  const todo = (await db.getFirstAsync(
    'SELECT completed FROM todos WHERE id = ?',
    [todoId]
  )) as { completed: number } | null;
  
  if (!todo) {
    throw new Error('Todo not found');
  }
  
  const newCompleted = todo.completed === 1 ? 0 : 1;
  
  await db.runAsync(
    'UPDATE todos SET completed = ?, updated_at = ? WHERE id = ?',
    [newCompleted, now, todoId]
  );

  const allTodos = await getAllTodos(true);
  const updated = allTodos.find((t) => t.id === todoId);
  
  if (!updated) {
    throw new Error('Todo not found after update');
  }
  
  return updated;
}

/**
 * Set todo priority (max 3 priorities)
 */
export async function setPriority(todoId: string, priority: boolean): Promise<Todo> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  // If setting as priority, check if we already have 3
  if (priority) {
    const currentPriorities = (await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM todos WHERE priority = 1 AND completed = 0 AND id != ?',
      [todoId]
    )) as { count: number } | null;
    
    if (currentPriorities && currentPriorities.count >= 3) {
      throw new Error('Maximum 3 priority todos allowed');
    }
  }
  
  await db.runAsync(
    'UPDATE todos SET priority = ?, updated_at = ? WHERE id = ?',
    [priority ? 1 : 0, now, todoId]
  );

  const allTodos = await getAllTodos(true);
  const updated = allTodos.find((t) => t.id === todoId);
  
  if (!updated) {
    throw new Error('Todo not found after update');
  }
  
  return updated;
}

/**
 * Get top 3 priority todos
 */
export async function getPriorityTodos(): Promise<Todo[]> {
  const db = await getDatabase();
  const rows = (await db.getAllAsync(
    'SELECT * FROM todos WHERE priority = 1 AND completed = 0 ORDER BY (order_index IS NULL) ASC, order_index ASC, created_at ASC LIMIT 3'
  )) as {
    id: string;
    text: string;
    completed: number;
    priority: number;
    order_index: number | null;
    due_at: string | null;
    estimated_minutes: number | null;
    created_at: string;
    updated_at: string;
  }[];

  return rows.map((row: {
    id: string;
    text: string;
    completed: number;
    priority: number;
    order_index: number | null;
    due_at: string | null;
    estimated_minutes: number | null;
    created_at: string;
    updated_at: string;
  }) => ({
    id: row.id,
    text: row.text,
    completed: row.completed === 1,
    priority: row.priority === 1,
    orderIndex: row.order_index ?? undefined,
    dueAt: row.due_at,
    estimatedMinutes: row.estimated_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Get todo completion statistics
 */
export async function getTodoStats(): Promise<{
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}> {
  const db = await getDatabase();
  const total = (await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM todos'
  )) as { count: number } | undefined;
  
  const completed = (await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM todos WHERE completed = 1'
  )) as { count: number } | undefined;
  
  const totalCount = total?.count || 0;
  const completedCount = completed?.count || 0;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return {
    total: totalCount,
    completed: completedCount,
    pending: pendingCount,
    completionRate,
  };
}

/**
 * Delete a todo
 */
export async function deleteTodo(todoId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM todos WHERE id = ?', [todoId]);
}

/**
 * Update todo text
 */
export async function updateTodo(todoId: string, text: string): Promise<Todo> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  await db.runAsync(
    'UPDATE todos SET text = ?, updated_at = ? WHERE id = ?',
    [text, now, todoId]
  );

  const allTodos = await getAllTodos(true);
  const updated = allTodos.find((t) => t.id === todoId);
  
  if (!updated) {
    throw new Error('Todo not found after update');
  }
  
  return updated;
}

/**
 * Update todo details: dueAt (ISO string or null) and estimatedMinutes (number or null)
 */
export async function updateTodoDetails(
  todoId: string,
  details: { dueAt: string | null; estimatedMinutes: number | null }
): Promise<Todo> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE todos SET due_at = ?, estimated_minutes = ?, updated_at = ? WHERE id = ?',
    [details.dueAt, details.estimatedMinutes, now, todoId]
  );

  const allTodos = await getAllTodos(true);
  const updated = allTodos.find((t) => t.id === todoId);
  if (!updated) {
    throw new Error('Todo not found after update');
  }
  return updated;
}

/**
 * Reorder a contiguous subset of todos given their ids in the new order.
 * Only reindexes the provided ids, starting at the current minimum index among them.
 */
export async function reorderTodos(idsInOrder: string[]): Promise<void> {
  if (idsInOrder.length === 0) return;
  const db = await getDatabase();

  // Get current indices for these ids
  const placeholders = idsInOrder.map(() => '?').join(',');
  const current = (await db.getAllAsync(
    `SELECT id, order_index FROM todos WHERE id IN (${placeholders})` as any,
    idsInOrder as any
  )) as { id: string; order_index: number | null }[];

  if (current.length === 0) return;
  const existingIndices: number[] = current
    .map((r: { id: string; order_index: number | null }) => (r.order_index == null ? Number.MAX_SAFE_INTEGER : r.order_index))
    .filter((n: number) => Number.isFinite(n));
  const startIndex = existingIndices.length > 0 ? Math.min(...existingIndices) : 0;

  // Assign consecutive indices to the provided ids starting from startIndex
  await db.execAsync('BEGIN');
  try {
    for (let i = 0; i < idsInOrder.length; i++) {
      const id = idsInOrder[i];
      const newIndex = startIndex + i;
      await db.runAsync('UPDATE todos SET order_index = ? WHERE id = ?', [newIndex, id]);
    }
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
}

