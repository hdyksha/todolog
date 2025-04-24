// 優先度の型定義
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

// タグの型定義
export interface Tag {
  color: string;
  description?: string;
}

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
  // 後方互換性のためにcategoryフィールドを残す（オプショナル）
  category?: string;
}

// 通知の型定義
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// フィルターオプションの型定義
export interface FilterOptions {
  priority: Priority | 'all';
  tags?: string[];
  searchTerm: string;
  // 後方互換性のためにcategoryフィールドを残す
  category?: string | null;
}

// ユーザー設定の型定義
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultPriority: Priority;
  defaultView: 'all' | 'active' | 'completed';
  showCompletedTasks: boolean;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortDirection: 'asc' | 'desc';
}
