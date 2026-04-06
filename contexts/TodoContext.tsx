import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { 
  getAllTodos, 
  getTodoStats, 
  toggleTodo as toggleTodoService, 
  createTodo as createTodoService, 
  deleteTodo as deleteTodoService,
  updateTodoDetails as updateTodoDetailsService
} from '@/services/todo-service';
import { initDatabase } from '@/services/database';

interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

interface TodoContextType {
  todos: Todo[];
  stats: TodoStats;
  isLoading: boolean;
  refreshTodos: () => Promise<void>;
  addTodo: (text: string, priority: boolean) => Promise<Todo>;
  toggleTodo: (id: string) => Promise<Todo>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodoDetails: (id: string, details: { dueAt: string | null; estimatedMinutes: number | null }) => Promise<Todo>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshTodos = useCallback(async () => {
    try {
      await initDatabase();
      const allTodos = await getAllTodos(true);
      const todoStats = await getTodoStats();
      setTodos(allTodos);
      setStats(todoStats);
    } catch (error) {
      console.error('[TodoContext] Error refreshing todos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTodos();
  }, [refreshTodos]);

  const addTodo = async (text: string, priority: boolean) => {
    const newTodo = await createTodoService(text, priority);
    await refreshTodos();
    return newTodo;
  };

  const toggleTodo = async (id: string) => {
    const updatedTodo = await toggleTodoService(id);
    await refreshTodos();
    return updatedTodo;
  };

  const deleteTodo = async (id: string) => {
    await deleteTodoService(id);
    await refreshTodos();
  };

  const updateTodoDetails = async (id: string, details: { dueAt: string | null; estimatedMinutes: number | null }) => {
    const updatedTodo = await updateTodoDetailsService(id, details);
    await refreshTodos();
    return updatedTodo;
  };

  return (
    <TodoContext.Provider 
      value={{ 
        todos, 
        stats, 
        isLoading, 
        refreshTodos, 
        addTodo, 
        toggleTodo, 
        deleteTodo, 
        updateTodoDetails 
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
