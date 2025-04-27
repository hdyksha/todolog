export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags?: string[];
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  memo?: string;
}

export interface Tag {
  color: string;
}

export interface TaskFilter {
  status?: 'all' | 'active' | 'completed';
  priority?: Priority | 'all';
  tags?: string[];
  search?: string;
  dueDate?: 'all' | 'overdue' | 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'future' | 'none';
}

export interface TaskSort {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt' | 'completedAt';
  direction: 'asc' | 'desc';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultFilter: TaskFilter;
  defaultSort: TaskSort;
  showCompletedTasks: boolean;
  showDueDates: boolean;
  showPriority: boolean;
  showTags: boolean;
}

export interface NotificationType {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ShortcutDefinition {
  key: string;
  description: string;
  scope?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  withDueDate: number;
  withoutDueDate: number;
  withTags: number;
  withoutTags: number;
  withMemo: number;
  withoutMemo: number;
}

export interface ArchiveStats {
  totalArchived: number;
  archivedByMonth: Record<string, number>;
  archivedByTag: Record<string, number>;
  archivedByPriority: Record<string, number>;
}
