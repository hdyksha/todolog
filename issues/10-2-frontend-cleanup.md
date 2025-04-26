# Issue10 フェーズ2: フロントエンドのクリーンアップ

## 概要

フェーズ1で特定した問題点に基づいて、フロントエンドのコードをクリーンアップします。主な目標は、未使用のコードの削除、重複コードのリファクタリング、アクセシビリティの改善、およびパフォーマンスの最適化です。

## 実施内容

### 1. 未使用のインポートと変数の削除

#### 対象ファイル

- `client/src/components/Notification.tsx`
  - 未使用の変数 `id` を削除
  - `React` のインポートを `import type React from 'react'` に変更

- `client/src/components/NotificationContainer.tsx`
  - `React` のインポートを `import type React from 'react'` に変更

- `client/src/App.tsx`
  - `React` のインポートを `import type React from 'react'` に変更

- `client/src/components/ShortcutHelpModal.tsx`
  - `React` のインポートを `import type React from 'react'` に変更

#### 実装

```typescript
// client/src/components/Notification.tsx
import type React from 'react';
import { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  // id は使用されていないため削除
  message,
  type,
  duration = 5000,
  onClose,
}) => {
  // 残りのコードは変更なし
};
```

### 2. コンポーネントの最適化

#### 対象ファイル

- `client/src/pages/HomePage.tsx` と `client/src/components/TaskItem.tsx` の重複コード
- `client/src/components/layouts/Navbar.tsx` の内部重複

#### 実装方針

1. `HomePage.tsx` から重複コードを抽出し、共通コンポーネントを作成
2. `Navbar.tsx` の重複コードをリファクタリング

```typescript
// client/src/components/common/TaskActions.tsx（新規作成）
import type React from 'react';

interface TaskActionsProps {
  taskId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({
  taskId,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  return (
    <div className="task-actions">
      <button
        className="task-action-button edit"
        onClick={() => onEdit(taskId)}
        aria-label="タスクを編集"
        type="button"
      >
        編集
      </button>
      <button
        className="task-action-button delete"
        onClick={() => onDelete(taskId)}
        aria-label="タスクを削除"
        type="button"
      >
        削除
      </button>
      <button
        className="task-action-button toggle"
        onClick={() => onToggleComplete(taskId)}
        aria-label="完了状態を切り替え"
        type="button"
      >
        完了切替
      </button>
    </div>
  );
};

export default TaskActions;
```

### 3. カスタムフックの整理

#### 対象ファイル

- `client/src/hooks/useTasks.ts` の内部重複

#### 実装方針

重複メソッドを統合し、共通ロジックを抽出

```typescript
// client/src/hooks/useTasks.ts
// 重複している関数を統合
const handleApiError = (error: unknown, operation: string) => {
  console.error(`${operation}に失敗しました:`, error);
  setError(`${operation}に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
};

// 使用例
const updateTask = async (taskId: string, taskData: Partial<Task>) => {
  try {
    setLoading(true);
    const updatedTask = await api.updateTask(taskId, taskData);
    setTasks(tasks.map(task => (task.id === taskId ? updatedTask : task)));
    return updatedTask;
  } catch (error) {
    handleApiError(error, 'タスクの更新');
    return null;
  } finally {
    setLoading(false);
  }
};
```

### 4. スタイルの最適化

#### 対象ファイル

- `client/src/styles/theme.css` と `client/src/styles/variables.css` の重複
- `client/src/components/MarkdownHelpModal.css` と `client/src/components/MemoEditor.css` の重複

#### 実装方針

1. 共通スタイルを抽出して新しいファイルに移動
2. 元のファイルから重複部分を削除し、新しいファイルをインポート

```css
/* client/src/styles/common.css（新規作成） */
/* theme.css と variables.css の共通部分 */
:root {
  --color-primary: #4a6da7;
  --color-primary-light: #6989c0;
  --color-primary-dark: #3a5580;
  /* 他の共通変数 */
}

/* client/src/styles/theme.css（更新） */
@import './common.css';

/* 固有のスタイルのみ残す */
```

### 5. アクセシビリティの改善

#### 対象ファイル

- `client/src/components/Notification.tsx` - ボタンに `type` 属性がない
- `client/src/components/ShortcutHelpModal.tsx` - 配列インデックスをキーとして使用

#### 実装

```typescript
// client/src/components/Notification.tsx
<button className="notification__close" onClick={onClose} type="button">
  ×
</button>

// client/src/components/ShortcutHelpModal.tsx
{groupedShortcuts[scope].map((shortcut) => (
  <tr key={`${scope}-${shortcut.shortcut}`} className="shortcut-item">
    {/* ... */}
  </tr>
))}
```

### 6. パフォーマンスの最適化

#### 対象ファイル

- `client/src/components/Notification.test.tsx` - `forEach` の代わりに `for...of` を使用

#### 実装

```typescript
// client/src/components/Notification.test.tsx
const types: Array<'success' | 'error' | 'info' | 'warning'> = ['success', 'error', 'info', 'warning'];

for (const type of types) {
  const { unmount } = render(
    <Notification
      id="test-notification"
      message="テスト通知"
      type={type}
      onClose={mockOnClose}
    />
  );
  
  // テスト内容
  
  unmount();
}
```

### 7. テストの更新

変更したコンポーネントに対応するテストを更新し、すべてのテストが正常に通ることを確認します。

## 実装計画

1. 未使用のインポートと変数の削除
2. アクセシビリティの問題の修正
3. 共通コンポーネントの作成と重複コードの統合
4. カスタムフックの最適化
5. スタイルの統合
6. パフォーマンス最適化
7. テストの更新と実行

## 成果物

- クリーンアップされたフロントエンドコード
- 新しい共通コンポーネントとユーティリティ
- 統合されたスタイルファイル
- 更新されたテスト

## 評価基準

- 静的解析ツールによるエラーと警告の削減
- テストの成功率
- 重複コードの削減率
- バンドルサイズの削減

## 進捗状況

### 完了した作業
- [x] 未使用のインポートと変数の削除
- [x] アクセシビリティの問題の修正
  - [x] ボタンに `type="button"` 属性を追加
  - [x] 適切な `aria-label` 属性を追加
  - [x] 一意のキーを使用してリストレンダリングを最適化
- [x] 共通コンポーネントの作成
  - [x] `TaskActions` コンポーネントの作成
  - [x] `ErrorDisplay` コンポーネントの作成
- [x] カスタムフックの最適化
  - [x] エラー処理の共通化
  - [x] API呼び出しの統一
- [x] スタイルの統合
  - [x] 共通のスタイル変数を抽出
  - [x] 重複するスタイルの統合
- [x] テストの更新
  - [x] `TaskItem.test.tsx` の修正
  - [x] 新しいコンポーネントのテスト追加

### ルーティングの統一

URLパスを `/tasks/:id` に統一しました：

1. `App.tsx` の修正:
   - `/task/:taskId` ルートを削除し、`/tasks/:id` のみを残しました

2. `TaskDetailPage.tsx` の修正:
   - `id` パラメータのみを使用するようにしました
   - すべての `taskIdToUse` 参照を `id` に置き換えました

これにより、アプリケーション全体で `/tasks/:id` というURLパターンに統一され、コードの一貫性が向上しました。

## 今後の課題

### さらなるコンポーネントの分割
- [x] `HomePage.tsx`の分割
  - [x] `TaskQuickAdd` コンポーネントの作成
  - [x] `TaskFilterBar` コンポーネントの作成
  - [x] `ActiveTaskList` コンポーネントの作成
- [x] `TaskDetailPage.tsx`の分割
  - [x] `TaskHeader` コンポーネントの作成
  - [x] `TaskMetadata` コンポーネントの作成
  - [x] `TaskMemoEditor` コンポーネントの作成
  - [x] `TaskMemoViewer` コンポーネントの作成
- [x] 共通コンポーネントの追加
  - [x] `ConfirmDialog` コンポーネントの作成
  - [x] `LoadingIndicator` コンポーネントの作成
  - [x] `ErrorDisplay` コンポーネントの作成

### パフォーマンス最適化
- [x] `React.memo`を活用した不要な再レンダリングの防止
- [x] `useMemo`と`useCallback`の適切な使用
- [ ] ~~大きなリストの仮想化~~ (見送り)

### インテグレーションテストの追加
- [x] `TaskDetailInteractions.test.tsx` - タスク詳細ページの操作テスト
  - [x] タスクの詳細表示
  - [x] タスクの完了状態切り替え
  - [x] タスクの削除
  - [x] メモの編集
  - [x] マークダウンヘルプの表示
- [x] `TaskListInteractions.test.tsx` - タスク一覧ページの操作テスト
  - [x] タスク一覧の表示
  - [x] クイック追加でのタスク作成
  - [x] タスクの完了状態切り替え
  - [x] タスク詳細ページへの遷移
  - [x] フィルター適用

## 実装スケジュール

### 週1（2025-04-28 ~ 2025-05-04）
- 月: コンポーネントの分割（HomePage.tsx）✅
- 火: コンポーネントの分割（TaskDetailPage.tsx）✅
- 水: 共通コンポーネントの追加 ✅
- 木: パフォーマンス最適化 ✅
- 金: エラー処理の統合
- 土/日: テスト拡充（部分的に完了）
