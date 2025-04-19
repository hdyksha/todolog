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

// タスク作成の入力型
export interface CreateTaskInput {
  title: string;
  priority?: Priority;
  category?: string;
  dueDate?: string;
  memo?: string;
}

// タスク更新の入力型
export interface UpdateTaskInput {
  title?: string;
  completed?: boolean;
  priority?: Priority;
  category?: string;
  dueDate?: string;
  memo?: string;
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

// ページネーションの型定義
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// APIレスポンスの型定義
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// APIエラーの型定義
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
