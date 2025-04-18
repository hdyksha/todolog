// タスクの型定義
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
}

// 優先度の列挙型
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

// タスクフィルターの型定義
export interface TaskFilter {
  status?: 'all' | 'completed' | 'active';
  priority?: Priority;
  category?: string;
  searchTerm?: string;
  dueDate?: string;
}

// タスクソートの型定義
export interface TaskSort {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// 通知の型定義
export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
