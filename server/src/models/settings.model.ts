import { z } from 'zod';

/**
 * アプリケーション設定のスキーマ定義
 */
export const AppSettingsSchema = z.object({
  // ストレージ設定
  storage: z.object({
    // データディレクトリのパス
    dataDir: z.string().default('./data'),
    // 現在選択されているタスクファイル名
    currentTaskFile: z.string().default('tasks.json'),
    // 最近使用したタスクファイル一覧
    recentTaskFiles: z.array(z.string()).default([]),
  }),
  
  // アプリケーション設定
  app: z.object({
    // 最大表示タスク数
    maxTasksPerPage: z.number().int().positive().default(50),
    // 最大保持バックアップ数
    maxBackups: z.number().int().positive().default(10),
  }),
});

/**
 * アプリケーション設定の型定義
 */
export type AppSettings = z.infer<typeof AppSettingsSchema>;

/**
 * デフォルトのアプリケーション設定
 */
export const defaultSettings: AppSettings = {
  storage: {
    dataDir: './data',
    currentTaskFile: 'tasks.json',
    recentTaskFiles: [],
  },
  app: {
    maxTasksPerPage: 50,
    maxBackups: 10,
  },
};

/**
 * 設定更新用の型定義（部分的な更新を許可）
 */
export type UpdateSettingsInput = Partial<{
  storage: Partial<AppSettings['storage']>,
  app: Partial<AppSettings['app']>,
}>;
