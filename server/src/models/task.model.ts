import { z } from 'zod';

// 優先度の定義
export const PriorityEnum = z.enum(['high', 'medium', 'low']);
export type Priority = z.infer<typeof PriorityEnum>;

// 日付バリデーション用のヘルパー関数
const isValidDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// タスク作成時のスキーマ
export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内にしてください')
    .trim(),
  completed: z.boolean().default(false),
  priority: PriorityEnum.default('medium'),
  tags: z
    .array(z.string().max(50, 'タグは50文字以内にしてください').trim())
    .default([]),
  dueDate: z
    .string()
    .refine(val => !val || isValidDate(val), {
      message: '有効な日付形式ではありません',
    })
    .nullable()
    .optional(),
  memo: z
    .string()
    .max(1000, 'メモは1000文字以内にしてください')
    .trim()
    .optional(),
});

// タスク更新時のスキーマ
export const UpdateTaskSchema = CreateTaskSchema.partial();

// メモ更新用のスキーマ
export const MemoUpdateSchema = z.object({
  memo: z
    .string()
    .max(1000, 'メモは1000文字以内にしてください')
    .trim()
    .optional(),
});

// タスクの完全なスキーマ（IDと日時情報を含む）
export const TaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid('無効なID形式です'),
  createdAt: z
    .string()
    .refine(isValidDate, { message: '無効な作成日時です' }),
  updatedAt: z
    .string()
    .refine(isValidDate, { message: '無効な更新日時です' }),
});

// フィルタリング用のスキーマ
export const TaskFilterSchema = z.object({
  tags: z.array(z.string().trim()).optional(),
  completed: z.boolean().optional(),
  priority: PriorityEnum.optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'dueDate', 'priority'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// 型定義のエクスポート
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type MemoUpdateInput = z.infer<typeof MemoUpdateSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TaskFilter = z.infer<typeof TaskFilterSchema>;
