import { z } from 'zod';

// タグのスキーマ定義
export const TagSchema = z.object({
  name: z
    .string()
    .min(1, 'タグ名は必須です')
    .max(50, 'タグ名は50文字以内にしてください')
    .trim(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, '有効なカラーコードを入力してください')
    .optional(),
  description: z
    .string()
    .max(200, '説明は200文字以内にしてください')
    .trim()
    .optional(),
});

// タグ作成時のスキーマ
export const CreateTagSchema = TagSchema;

// タグ更新時のスキーマ
export const UpdateTagSchema = TagSchema.partial().omit({ name: true });

// 型定義のエクスポート
export type Tag = z.infer<typeof TagSchema>;
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
