# Issue 11: タスク完了日の記録と完了日ベースのアーカイブグルーピング

## 概要

現在のTodoLogアプリケーションでは、タスクの作成日（`createdAt`）と更新日（`updatedAt`）は記録されていますが、タスクが完了した正確な日時は記録されていません。アーカイブされたタスクは現在、更新日（`updatedAt`）に基づいてグループ化されていますが、これは必ずしもタスクが完了した日付を正確に反映していません。

この機能追加により、タスクが完了した正確な日時を記録し、アーカイブされたタスクを完了日ごとにグループ化して表示できるようにします。

## 目的

1. タスクが完了した正確な日時を記録する
2. アーカイブされたタスクを完了日ごとにグループ化して表示する
3. 完了日に基づいた統計情報やレポートの基盤を整備する

## 実装計画

### フェーズ1: データモデルの拡張

- [ ] **サーバーサイドのタスクモデル拡張**
  - [ ] `task.model.ts` に `completedAt` フィールド（nullable な日時型）を追加
  - [ ] `TaskSchema` と `CreateTaskSchema` を更新
  - [ ] 型定義を更新

- [ ] **クライアントサイドの型定義更新**
  - [ ] `client/src/types/index.ts` の `Task` インターフェースに `completedAt` フィールドを追加

- [ ] **データベースマイグレーション**
  - [ ] 既存のタスクデータに `completedAt` フィールドを追加するマイグレーションスクリプトを作成
  - [ ] 既に完了しているタスクの場合は `updatedAt` の値を `completedAt` にコピー

### フェーズ2: バックエンド機能の実装

- [ ] **タスク完了ロジックの更新**
  - [ ] `toggleTaskCompletion` エンドポイントを更新し、タスクを完了状態に変更する際に `completedAt` に現在の日時を設定
  - [ ] タスクを未完了状態に戻す際は `completedAt` を `null` に設定

- [ ] **タスク更新ロジックの更新**
  - [ ] `updateTask` エンドポイントを更新し、`completed` 状態が変更された場合に `completedAt` を適切に設定/クリア

- [ ] **API レスポンスの更新**
  - [ ] タスク取得エンドポイントのレスポンスに `completedAt` フィールドを含める

### フェーズ3: フロントエンド機能の実装

- [ ] **タスク完了ロジックの更新**
  - [ ] `useTaskActions` フックの `toggleTaskCompletion` 関数を更新し、API からの応答に含まれる `completedAt` を処理

- [ ] **アーカイブグルーピングロジックの更新**
  - [ ] `dateUtils.ts` の `groupTasksByDate` 関数を更新し、`updatedAt` の代わりに `completedAt` を使用してグループ化
  - [ ] `completedAt` が存在しない場合は `updatedAt` にフォールバック

- [ ] **UI コンポーネントの更新**
  - [ ] `ArchivedTaskList` コンポーネントを更新し、完了日でグループ化されたタスクを表示
  - [ ] 日付グループのヘッダーに「完了日: YYYY年MM月DD日」と表示

### フェーズ4: テストとドキュメント

- [ ] **テストの更新と追加**
  - [ ] バックエンドの単体テストを更新し、`completedAt` フィールドの処理を検証
  - [ ] フロントエンドのコンポーネントテストを更新
  - [ ] 統合テストを追加し、完了日の記録と表示が正しく機能することを確認

- [ ] **ドキュメントの更新**
  - [ ] API 仕様書を更新し、`completedAt` フィールドを追加
  - [ ] README.md を更新し、新機能について説明

## 技術的詳細

### データモデル変更

```typescript
// server/src/models/task.model.ts
export const TaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid('無効なID形式です'),
  createdAt: z
    .string()
    .refine(isValidDate, { message: '無効な作成日時です' }),
  updatedAt: z
    .string()
    .refine(isValidDate, { message: '無効な更新日時です' }),
  completedAt: z
    .string()
    .refine(val => !val || isValidDate(val), { message: '無効な完了日時です' })
    .nullable()
    .optional(),
});

// client/src/types/index.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  memo?: string;
}
```

### タスク完了ロジックの変更

```typescript
// server/src/services/task.service.ts
export const toggleTaskCompletion = async (id: string): Promise<Task> => {
  const task = await getTaskById(id);
  if (!task) {
    throw new NotFoundError(`ID: ${id} のタスクが見つかりません`);
  }

  const updatedTask = {
    ...task,
    completed: !task.completed,
    completedAt: !task.completed ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };

  await saveTask(updatedTask);
  return updatedTask;
};
```

### グルーピングロジックの変更

```typescript
// client/src/utils/dateUtils.ts
export const groupTasksByDate = (tasks: Task[]): TasksByDate => {
  return tasks.reduce((groups, task) => {
    // タスクの完了日（completedAt または updatedAt）から日付部分のみを抽出
    const dateStr = new Date(task.completedAt || task.updatedAt).toISOString().split('T')[0];
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    
    groups[dateStr].push(task);
    return groups;
  }, {} as TasksByDate);
};
```

## 期待される結果

- タスクが完了した正確な日時が記録される
- アーカイブされたタスクが完了日ごとにグループ化されて表示される
- 日付グループのヘッダーに「完了日: YYYY年MM月DD日」と表示される
- 既存のタスクデータとの互換性が維持される

## 影響範囲

- タスクデータモデル
- タスク完了/更新ロジック
- アーカイブ表示ロジック
- データベースのスキーマ

## 実装の優先度

中程度 - この機能はユーザーエクスペリエンスを向上させるものですが、アプリケーションの基本機能には影響しません。

## 見積もり工数

- フェーズ1: 2時間
- フェーズ2: 3時間
- フェーズ3: 3時間
- フェーズ4: 2時間
- 合計: 10時間

## 関連する既存の機能

- タスク完了機能
- アーカイブ表示機能
- タスク更新機能

## 注意点

- 既存のタスクデータとの互換性を維持するため、`completedAt` が存在しない場合は `updatedAt` にフォールバックする必要がある
- 完了日の表示形式は既存の日付表示形式と統一する
- タスクを未完了状態に戻した場合、`completedAt` を `null` に設定する必要がある
