import { z } from 'zod';

// 優先度の定義
export const PriorityEnum = z.enum(['high', 'medium', 'low']);
export type Priority = z.infer<typeof PriorityEnum>;

// タスク作成時のスキーマ
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内にしてください'),
  completed: z.boolean().default(false),
  priority: PriorityEnum.default('medium'),
  category: z.string().optional(),
  dueDate: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: '有効な日付形式ではありません' }
  ),
  memo: z.string().optional(),
});

// タスク更新時のスキーマ
export const UpdateTaskSchema = CreateTaskSchema.partial();

// タスクの完全なスキーマ（IDと日時情報を含む）
export const TaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 型定義のエクスポート
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type Task = z.infer<typeof TaskSchema>;
