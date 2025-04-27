// 優先度の型定義
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

// タグの型定義
export interface Tag {
  name?: string; // 主にAPIレスポンス用
  color: string;
  description?: string;
}

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[]; // 必須フィールドに変更
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  memo?: string;
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
}

// ユーザー設定の型定義
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultPriority: Priority;
  defaultView: 'all' | 'active' | 'completed';
  showCompletedTasks: boolean;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'completedAt';
  sortDirection: 'asc' | 'desc';
}
