// タスクの優先度
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

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
