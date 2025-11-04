export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: boolean;
  orderIndex?: number;
  dueAt?: string | null;
  estimatedMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

