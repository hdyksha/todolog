// タスクの優先度
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

// タグの型定義
export interface Tag {
  name: string;
  color?: string;
  description?: string;
}

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];  // カテゴリの代わりに複数タグを使用
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
}
