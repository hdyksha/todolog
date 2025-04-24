// タスクの優先度
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

// タグの型定義
export interface Tag {
  color: string;       // タグの色
  description?: string; // タグの説明
}

// タスクの型定義
export interface Task {
  id: string;          // ユニークID
  title: string;       // タスクのタイトル
  completed: boolean;  // 完了状態
  priority: Priority;  // 優先度（High, Medium, Low）
  tags?: string[];     // タグ（オプション）
  dueDate?: string;    // 期限（ISO形式の文字列）
  createdAt: string;   // 作成日時（ISO形式の文字列）
  updatedAt: string;   // 更新日時（ISO形式の文字列）
  memo?: string;       // メモ（オプション）
  category?: string;   // 後方互換性のためのカテゴリ（オプション）
}

// タスクフィルターの型定義
export interface TaskFilter {
  status: 'all' | 'completed' | 'active';
  priority?: Priority;
  tags?: string[];
  searchTerm?: string;
}

// タスクソートの型定義
export interface TaskSort {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}
