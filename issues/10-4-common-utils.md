# Issue10 フェーズ4: 共通ユーティリティとタイプの最適化

## 概要

フロントエンドとバックエンドで共通して使用されるユーティリティ関数や型定義を整理し、重複を削除して一貫性を確保します。また、未使用のユーティリティや型定義を削除し、コードベースをスリム化します。

## 実施内容

### 1. 共通ユーティリティ関数の整理

#### 対象ファイル

- `client/src/utils/dateUtils.ts` と `server/src/utils/dateUtils.ts`
- `client/src/utils/stringUtils.ts` と `server/src/utils/stringUtils.ts`
- `client/src/utils/validationUtils.ts` と `server/src/utils/validationUtils.ts`

#### 実装方針

1. 重複したユーティリティ関数を共通モジュールに統合
2. 未使用のユーティリティ関数を削除
3. 関数の命名と引数を統一

```typescript
// 共通の日付フォーマット関数の例
// common/utils/dateUtils.ts（新規作成）
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isValidDate = (date: unknown): boolean => {
  if (typeof date === 'string') {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }
  return date instanceof Date && !isNaN(date.getTime());
};
```

### 2. 型定義の最適化

#### 対象ファイル

- `client/src/types/index.ts` と `server/src/types/index.ts`
- `client/src/types/task.ts` と `server/src/types/task.ts`

#### 実装方針

1. 重複した型定義を共通モジュールに統合
2. 未使用の型を削除
3. 型の命名と構造を統一

```typescript
// common/types/task.ts（新規作成）
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
}

export interface TaskCreateInput {
  title: string;
  priority?: Priority;
  tags?: string[];
  dueDate?: string;
  memo?: string;
}

export interface TaskUpdateInput {
  title?: string;
  completed?: boolean;
  priority?: Priority;
  tags?: string[];
  dueDate?: string;
  memo?: string;
}
```

### 3. 定数とコンフィグの整理

#### 対象ファイル

- `client/src/constants/index.ts` と `server/src/constants/index.ts`
- `client/src/config/index.ts` と `server/src/config/index.ts`

#### 実装方針

1. 重複した定数を共通モジュールに統合
2. 未使用の設定値を削除
3. 環境変数の取り扱いを統一

```typescript
// common/constants/index.ts（新規作成）
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_TITLE_LENGTH = 100;
export const MAX_MEMO_LENGTH = 5000;
export const MAX_TAGS_PER_TASK = 10;
export const MAX_TAG_LENGTH = 30;

export const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  TAGS: '/api/tags',
  BACKUPS: '/api/backups',
  EXPORT: '/api/export',
  IMPORT: '/api/import',
  HEALTH: '/health',
};
```

### 4. バリデーションロジックの統一

#### 対象ファイル

- `client/src/utils/validationUtils.ts` と `server/src/utils/validationUtils.ts`
- `client/src/hooks/useFormValidation.ts`
- `server/src/middleware/validation.ts`

#### 実装方針

1. 共通のバリデーションルールを作成
2. フロントエンドとバックエンドで同じバリデーションロジックを使用
3. Zodスキーマの共有

```typescript
// common/validation/taskSchema.ts（新規作成）
import { z } from 'zod';
import { MAX_TITLE_LENGTH, MAX_MEMO_LENGTH, MAX_TAGS_PER_TASK, MAX_TAG_LENGTH } from '../constants';

export const taskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(MAX_TITLE_LENGTH, `タイトルは${MAX_TITLE_LENGTH}文字以内で入力してください`),
  completed: z.boolean().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  tags: z.array(z.string().max(MAX_TAG_LENGTH)).max(MAX_TAGS_PER_TASK).optional(),
  dueDate: z.string().refine(val => !val || !isNaN(new Date(val).getTime()), {
    message: '有効な日付を入力してください',
  }).optional(),
  memo: z.string().max(MAX_MEMO_LENGTH, `メモは${MAX_MEMO_LENGTH}文字以内で入力してください`).optional(),
});

export type TaskValidationSchema = z.infer<typeof taskSchema>;
```

## 実装計画

1. 共通ユーティリティ関数の整理
2. 型定義の最適化
3. 定数とコンフィグの整理
4. バリデーションロジックの統一
5. テストの更新と実行

## 成果物

- 統合された共通ユーティリティモジュール
- 最適化された型定義
- 統一された定数とコンフィグ
- 共通のバリデーションロジック
- 更新されたテスト

## 評価基準

- 重複コードの削減率
- 型の一貫性
- テストの成功率
- バンドルサイズの削減

## 進捗状況

### 計画中の作業
- [ ] 共通ユーティリティ関数の整理
  - [ ] 日付関連ユーティリティの統合
  - [ ] 文字列操作ユーティリティの統合
  - [ ] バリデーションユーティリティの統合
- [ ] 型定義の最適化
  - [ ] タスク関連の型定義の統合
  - [ ] API関連の型定義の統合
- [ ] 定数とコンフィグの整理
  - [ ] アプリケーション定数の統合
  - [ ] 環境変数の取り扱いの統一
- [ ] バリデーションロジックの統一
  - [ ] Zodスキーマの共有
  - [ ] バリデーションエラーメッセージの統一

## 実装スケジュール

- 共通ユーティリティ関数の整理: 2025-04-30
- 型定義の最適化: 2025-04-30
- 定数とコンフィグの整理: 2025-05-01
- バリデーションロジックの統一: 2025-05-01
- テストの更新と実行: 2025-05-02
