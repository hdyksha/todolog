// タスクの優先度
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

// タスクの型定義
export interface Task {
  id: string;          // ユニークID
  title: string;       // タスクのタイトル
  completed: boolean;  // 完了状態
  priority: Priority;  // 優先度（High, Medium, Low）
  category?: string;   // カテゴリ（オプション）
  dueDate?: Date;      // 期限（オプション）
  createdAt: Date;     // 作成日時
  updatedAt: Date;     // 更新日時
  memo?: string;       // メモ（オプション）
}

// タスクフィルターの型定義
export interface TaskFilter {
  status: 'all' | 'completed' | 'active';
  priority?: Priority;
  category?: string;
  searchTerm?: string;
}

// タスクソートの型定義
export interface TaskSort {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}
