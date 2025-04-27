# Issue10 フェーズ5: パフォーマンス最適化

## 概要

アプリケーション全体のパフォーマンスを向上させるために、レンダリングの最適化、データ取得の効率化、バンドルサイズの削減、およびメモリリークの修正を行います。

## 実施内容

### 1. レンダリングパフォーマンスの改善

#### 対象ファイル

- `client/src/components/TaskList.tsx`
- `client/src/components/TaskItem.tsx`
- `client/src/pages/HomePage.tsx`

#### 実装方針

1. 不要な再レンダリングを防ぐために `React.memo` を適用
2. 計算コストの高い処理に `useMemo` を適用
3. イベントハンドラに `useCallback` を適用

```typescript
// client/src/components/TaskItem.tsx
// React.memo の適用例
import type React from 'react';
import { memo } from 'react';
import { Task, Priority } from '../types';
// 他のインポート...

interface TaskItemProps {
  task: Task;
  isArchived?: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onEditMemo?: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isArchived = false,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  // コンポーネントの実装...
};

// メモ化してエクスポート
export default memo(TaskItem);
```

```typescript
// client/src/pages/HomePage.tsx
// useCallback と useMemo の適用例
import { useCallback, useMemo } from 'react';
// 他のインポート...

const HomePage: React.FC = () => {
  // 状態など...
  
  // イベントハンドラをメモ化
  const handleToggleComplete = useCallback((id: string) => {
    toggleTaskCompletion(id);
  }, [toggleTaskCompletion]);
  
  const handleDeleteTask = useCallback((id: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      deleteTask(id);
    }
  }, [deleteTask]);
  
  // フィルタリングされたタスクリストをメモ化
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // フィルタリングロジック...
      })
      .sort((a, b) => {
        // ソートロジック...
      });
  }, [tasks, filters, sortOrder]);
  
  // 残りのコンポーネント実装...
};
```

### 2. データ取得の最適化

#### 対象ファイル

- `client/src/hooks/useTasks.ts`
- `client/src/services/api.ts`
- `server/src/controllers/taskController.ts`

#### 実装方針

1. APIリクエストの最適化
2. キャッシュ戦略の改善
3. データの部分的な更新

```typescript
// client/src/services/api.ts
// キャッシュ戦略の実装例
import { setupCache } from 'axios-cache-adapter';
import axios from 'axios';

// キャッシュアダプターの設定
const cache = setupCache({
  maxAge: 15 * 60 * 1000, // 15分
  exclude: { query: false },
  key: req => {
    // URLとクエリパラメータに基づいてキャッシュキーを生成
    return req.url + JSON.stringify(req.params);
  },
});

// キャッシュを適用したAxiosインスタンスの作成
const api = axios.create({
  adapter: cache.adapter,
  baseURL: '/api',
});

// APIメソッドの実装...
```

```typescript
// server/src/controllers/taskController.ts
// 部分的な更新の最適化例
const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // 変更されたフィールドのみを更新
    const updatedTask = await taskService.updateTask(id, updateData);
    
    res.json(updatedTask);
  } catch (error) {
    handleApiError(error, res, 'タスクの更新');
  }
};
```

### 3. バンドルサイズの削減

#### 対象ファイル

- `client/vite.config.ts`
- `client/src/main.tsx`
- `client/src/pages/index.ts`

#### 実装方針

1. コード分割の適用
2. 大きなライブラリの代替検討
3. 動的インポートの活用

```typescript
// client/src/App.tsx
// React.lazy と Suspense を使用したコード分割
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// 遅延ロードするコンポーネント
const HomePage = lazy(() => import('./pages/HomePage'));
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TagManagementPage = lazy(() => import('./pages/TagManagementPage'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="tags" element={<TagManagementPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
```

### 4. メモリリークの特定と修正

#### 対象ファイル

- `client/src/hooks/useTasks.ts`
- `client/src/components/NotificationContainer.tsx`
- `client/src/pages/TaskDetailPage.tsx`

#### 実装方針

1. useEffectのクリーンアップ関数の確認
2. イベントリスナーの適切な削除
3. 非同期処理のキャンセル

```typescript
// client/src/pages/TaskDetailPage.tsx
// useEffect のクリーンアップ例
import { useEffect, useRef } from 'react';
// 他のインポート...

const TaskDetailPage: React.FC = () => {
  // 状態など...
  const isMounted = useRef(true);
  
  useEffect(() => {
    // コンポーネントのマウント状態を追跡
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const handleSaveMemo = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updateMemo(id, memo);
      // マウントされている場合のみ状態を更新
      if (isMounted.current) {
        setIsEditingMemo(false);
        setIsPreviewMode(false);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('メモ更新エラー:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  };
  
  // 残りのコンポーネント実装...
};
```

```typescript
// client/src/hooks/useTasks.ts
// AbortController を使用した非同期処理のキャンセル
import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import * as api from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTasks = useCallback(async () => {
    const abortController = new AbortController();
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getTasks(abortController.signal);
      setTasks(data);
    } catch (error) {
      // AbortError は無視
      if (error.name !== 'AbortError') {
        setError('タスクの取得に失敗しました');
        console.error('タスク取得エラー:', error);
      }
    } finally {
      setLoading(false);
    }
    
    return () => {
      abortController.abort();
    };
  }, []);
  
  // 残りのフック実装...
  
  return { tasks, loading, error, fetchTasks, /* 他のメソッド */ };
};
```

## 実装計画

1. レンダリングパフォーマンスの改善
2. データ取得の最適化
3. バンドルサイズの削減
4. メモリリークの特定と修正
5. パフォーマンステストと検証

## 成果物

- 最適化されたコンポーネント
- 効率的なデータ取得メカニズム
- 削減されたバンドルサイズ
- メモリリークのない実装
- パフォーマンス測定レポート

## 評価基準

- 初期ロード時間の改善
- メモリ使用量の削減
- バンドルサイズの削減
- レンダリング時間の改善
- Lighthouse スコアの向上

## 進捗状況

### 計画中の作業
- [ ] レンダリングパフォーマンスの改善
  - [ ] React.memo の適用
  - [ ] useMemo/useCallback の適用
- [ ] データ取得の最適化
  - [ ] APIリクエストの最適化
  - [ ] キャッシュ戦略の改善
- [ ] バンドルサイズの削減
  - [ ] コード分割の適用
  - [ ] 動的インポートの活用
- [ ] メモリリークの特定と修正
  - [ ] useEffect のクリーンアップ関数の確認
  - [ ] 非同期処理のキャンセル

## 実装スケジュール

- レンダリングパフォーマンスの改善: 2025-05-01
- データ取得の最適化: 2025-05-01
- バンドルサイズの削減: 2025-05-02
- メモリリークの特定と修正: 2025-05-02
- パフォーマンステストと検証: 2025-05-02
