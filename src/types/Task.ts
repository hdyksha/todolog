/**
 * タスクの優先度を表す型
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * タスクのステータスを表す型
 */
export type TaskStatus = 'active' | 'completed' | 'archived';

/**
 * タスクの基本情報を表すインターフェース
 */
export interface BaseTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO 8601形式の日付文字列
}

/**
 * 拡張されたタスク情報を表すインターフェース
 */
export interface Task extends BaseTask {
  updatedAt?: string; // ISO 8601形式の日付文字列
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: string; // ISO 8601形式の日付文字列
  notes?: string;
}

/**
 * タスク作成時に必要な情報を表す型
 */
export type TaskCreationData = Omit<BaseTask, 'id' | 'completed' | 'createdAt'> & {
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: string;
  notes?: string;
};

/**
 * タスク更新時に使用する型（IDは変更不可）
 */
export type TaskUpdateData = Partial<Omit<Task, 'id' | 'createdAt'>>;

/**
 * 日付ごとにグループ化されたタスクを表す型
 */
export interface TasksByDate {
  [date: string]: Task[];
}

/**
 * タスクのフィルタリング条件を表す型
 */
export interface TaskFilter {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  searchText?: string;
}

/**
 * タスクのソート方法を表す型
 */
export type TaskSortMethod = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';

/**
 * タスクのソート順序を表す型
 */
export type SortOrder = 'asc' | 'desc';

/**
 * タスクのソート設定を表す型
 */
export interface TaskSortOptions {
  method: TaskSortMethod;
  order: SortOrder;
}

/**
 * タスクの検証結果を表す型
 */
export interface TaskValidationResult {
  isValid: boolean;
  errors: {
    field: keyof Task;
    message: string;
  }[];
}

/**
 * タスクを検証する関数
 * @param task 検証するタスク
 * @returns 検証結果
 */
export function validateTask(task: Task): TaskValidationResult {
  const errors: { field: keyof Task; message: string }[] = [];

  // テキストの検証
  if (!task.text || task.text.trim() === '') {
    errors.push({
      field: 'text',
      message: 'タスクのテキストは必須です',
    });
  } else if (task.text.length > 200) {
    errors.push({
      field: 'text',
      message: 'タスクのテキストは200文字以内にしてください',
    });
  }

  // 日付の検証
  if (task.createdAt && isNaN(Date.parse(task.createdAt))) {
    errors.push({
      field: 'createdAt',
      message: '作成日の形式が正しくありません',
    });
  }

  if (task.updatedAt && isNaN(Date.parse(task.updatedAt))) {
    errors.push({
      field: 'updatedAt',
      message: '更新日の形式が正しくありません',
    });
  }

  if (task.dueDate && isNaN(Date.parse(task.dueDate))) {
    errors.push({
      field: 'dueDate',
      message: '期限日の形式が正しくありません',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 新しいタスクを作成する関数
 * @param text タスクのテキスト
 * @param additionalData 追加のタスクデータ
 * @returns 新しいタスクオブジェクト
 */
export function createTask(
  text: string,
  additionalData: Partial<Omit<Task, 'id' | 'text' | 'completed' | 'createdAt'>> = {}
): Task {
  const now = new Date().toISOString();
  return {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    completed: false,
    createdAt: now,
    ...additionalData,
  };
}

/**
 * タスクを日付ごとにグループ化する関数
 * @param tasks タスクの配列
 * @returns 日付ごとにグループ化されたタスク
 */
export function groupTasksByDate(tasks: Task[]): TasksByDate {
  return tasks.reduce<TasksByDate>((groups, task) => {
    // createdAtから日付部分のみを抽出（YYYY-MM-DD形式）
    const dateKey = task.createdAt.split('T')[0];

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(task);
    return groups;
  }, {});
}

/**
 * タスクをフィルタリングする関数
 * @param tasks タスクの配列
 * @param filter フィルタリング条件
 * @returns フィルタリングされたタスクの配列
 */
export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return tasks.filter(task => {
    // ステータスでフィルタリング
    if (filter.status) {
      const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
      const taskStatus: TaskStatus = task.completed ? 'completed' : 'active';
      if (!statusArray.includes(taskStatus)) {
        return false;
      }
    }

    // 優先度でフィルタリング
    if (filter.priority && task.priority) {
      const priorityArray = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      if (!priorityArray.includes(task.priority)) {
        return false;
      }
    }

    // タグでフィルタリング
    if (filter.tags && filter.tags.length > 0 && task.tags) {
      if (!filter.tags.some(tag => task.tags?.includes(tag))) {
        return false;
      }
    }

    // 日付範囲でフィルタリング
    if (filter.dateRange) {
      const taskDate = new Date(task.createdAt);

      if (filter.dateRange.start) {
        const startDate = new Date(filter.dateRange.start);
        if (taskDate < startDate) {
          return false;
        }
      }

      if (filter.dateRange.end) {
        const endDate = new Date(filter.dateRange.end);
        if (taskDate > endDate) {
          return false;
        }
      }
    }

    // テキスト検索
    if (filter.searchText && filter.searchText.trim() !== '') {
      const searchLower = filter.searchText.toLowerCase();
      const textLower = task.text.toLowerCase();
      const notesLower = task.notes?.toLowerCase() || '';

      if (!textLower.includes(searchLower) && !notesLower.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * タスクをソートする関数
 * @param tasks タスクの配列
 * @param sortOptions ソートオプション
 * @returns ソートされたタスクの配列
 */
export function sortTasks(tasks: Task[], sortOptions: TaskSortOptions): Task[] {
  const { method, order } = sortOptions;

  return [...tasks].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (method) {
      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        valueA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        valueB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        break;
      case 'dueDate':
        valueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        valueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        break;
      case 'priority':
        const priorityMap: Record<string, number> = {
          high: 3,
          medium: 2,
          low: 1,
          undefined: 0,
        };
        valueA = priorityMap[a.priority || 'undefined'];
        valueB = priorityMap[b.priority || 'undefined'];
        break;
      default:
        valueA = a.createdAt;
        valueB = b.createdAt;
    }

    const compareResult = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    return order === 'asc' ? compareResult : -compareResult;
  });
}
