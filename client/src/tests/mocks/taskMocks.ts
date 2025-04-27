import { Task, Priority } from '../../types';

export const mockTask: Task = {
  id: 'task-1',
  title: 'テストタスク',
  completed: false,
  priority: Priority.Medium,
  createdAt: '2025-04-01T10:00:00.000Z',
  updatedAt: '2025-04-01T10:00:00.000Z',
  memo: 'これはテストタスクのメモです。\n\n- 項目1\n- 項目2\n\n**重要な情報**',
  tags: ['テスト', '開発'],
  dueDate: '2025-04-30T23:59:59.000Z'
};

export const mockTasks: Task[] = [
  mockTask,
  {
    id: 'task-2',
    title: '完了済みタスク',
    completed: true,
    priority: Priority.High,
    createdAt: '2025-03-15T08:30:00.000Z',
    updatedAt: '2025-04-01T15:45:00.000Z',
    memo: '完了済みのタスクです。',
    tags: ['テスト', '完了'],
    dueDate: '2025-03-31T23:59:59.000Z'
  },
  {
    id: 'task-3',
    title: '優先度低タスク',
    completed: false,
    priority: Priority.Low,
    createdAt: '2025-04-02T14:20:00.000Z',
    updatedAt: '2025-04-02T14:20:00.000Z',
    tags: ['低優先度'],
  },
  {
    id: 'task-4',
    title: '期限切れタスク',
    completed: false,
    priority: Priority.Medium,
    createdAt: '2025-03-01T09:15:00.000Z',
    updatedAt: '2025-03-01T09:15:00.000Z',
    dueDate: '2025-03-10T23:59:59.000Z'
  },
  {
    id: 'task-5',
    title: 'タグなしタスク',
    completed: false,
    priority: Priority.Medium,
    createdAt: '2025-04-05T16:40:00.000Z',
    updatedAt: '2025-04-05T16:40:00.000Z',
  }
];
