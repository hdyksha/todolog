# タグ機能の実装ガイド

## 概要

このドキュメントでは、TodoLogアプリケーションのタグ機能の実装について説明します。タグ機能は、タスクを複数の視点から分類するための柔軟な方法を提供します。

## 目次

1. [データモデル](#データモデル)
2. [コンポーネント構造](#コンポーネント構造)
3. [状態管理](#状態管理)
4. [APIインターフェース](#apiインターフェース)
5. [フィルタリングロジック](#フィルタリングロジック)
6. [テスト戦略](#テスト戦略)

## データモデル

### タグの型定義

```typescript
// types/tag.ts
export interface Tag {
  color: string;
  description?: string;
}

export type TagsMap = Record<string, Tag>;
```

### タスクモデルの変更

```typescript
// types/task.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];  // カテゴリから変更
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
}
```

## コンポーネント構造

タグ機能は以下の主要コンポーネントで構成されています：

### 1. TagInput コンポーネント

タスクにタグを追加するための入力コンポーネント。

```
components/
  tags/
    TagInput.tsx       # タグ入力コンポーネント
    TagInput.css       # スタイル定義
    TagBadge.tsx       # 個別のタグ表示コンポーネント
```

主な機能：
- 複数タグの入力と表示
- オートコンプリート
- タグの追加/削除UI

### 2. TagManager コンポーネント

タグの作成、編集、削除を行うための管理コンポーネント。

```
components/
  tags/
    TagManager.tsx     # タグ管理コンポーネント
    TagManager.css     # スタイル定義
    TagForm.tsx        # タグ作成/編集フォーム
```

主な機能：
- タグ一覧表示
- タグの作成/編集/削除
- タグの色設定

### 3. TagFilter コンポーネント

タグによるタスクのフィルタリングを行うコンポーネント。

```
components/
  filters/
    TagFilter.tsx      # タグフィルターコンポーネント
    TagFilter.css      # スタイル定義
    TagCloud.tsx       # タグクラウド表示
```

主な機能：
- タグによるフィルタリング
- 複数タグの選択
- タグクラウド表示

## 状態管理

### TagContext

タグの状態を管理するためのコンテキスト。

```typescript
// contexts/TagContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Tag, TagsMap } from '../types';

interface TagState {
  tags: TagsMap;
  loading: boolean;
  error: Error | null;
}

type TagAction =
  | { type: 'FETCH_TAGS_START' }
  | { type: 'FETCH_TAGS_SUCCESS'; payload: TagsMap }
  | { type: 'FETCH_TAGS_ERROR'; payload: Error }
  | { type: 'ADD_TAG_SUCCESS'; payload: { name: string; tag: Tag } }
  | { type: 'UPDATE_TAG_SUCCESS'; payload: { name: string; tag: Tag } }
  | { type: 'DELETE_TAG_SUCCESS'; payload: string };

const TagContext = createContext<
  { state: TagState; dispatch: React.Dispatch<TagAction> } | undefined
>(undefined);

// ... reducer実装 ...

export const TagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tagReducer, {
    tags: {},
    loading: false,
    error: null
  });

  return (
    <TagContext.Provider value={{ state, dispatch }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTagContext must be used within a TagProvider');
  }
  return context;
};
```

### タグ関連のカスタムフック

```typescript
// hooks/useTags.ts
import { useEffect, useCallback } from 'react';
import { useTagContext } from '../contexts/TagContext';
import api from '../services/api';
import { Tag } from '../types';

export const useTags = () => {
  const { state, dispatch } = useTagContext();

  const fetchTags = useCallback(async () => {
    dispatch({ type: 'FETCH_TAGS_START' });
    try {
      const tags = await api.fetchTags();
      dispatch({ type: 'FETCH_TAGS_SUCCESS', payload: tags });
    } catch (error) {
      dispatch({ type: 'FETCH_TAGS_ERROR', payload: error as Error });
    }
  }, [dispatch]);

  const createTag = useCallback(
    async (name: string, color: string, description?: string) => {
      try {
        const updatedTags = await api.createTag(name, color, description);
        dispatch({
          type: 'ADD_TAG_SUCCESS',
          payload: { name, tag: { color, description } }
        });
        return updatedTags;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const deleteTag = useCallback(
    async (name: string) => {
      try {
        const updatedTags = await api.deleteTag(name);
        dispatch({ type: 'DELETE_TAG_SUCCESS', payload: name });
        return updatedTags;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags: state.tags,
    loading: state.loading,
    error: state.error,
    fetchTags,
    createTag,
    deleteTag
  };
};
```

## APIインターフェース

タグ機能のためのAPI呼び出しは、`api.ts`に実装されています：

```typescript
// services/api.ts

// タグ一覧の取得
async fetchTags(): Promise<Record<string, Tag>> {
  const response = await fetch(`${API_BASE_URL}/tags`);
  if (!response.ok) {
    throw new Error('タグの取得に失敗しました');
  }
  return response.json();
},

// タグの作成
async createTag(tagName: string, color: string, description?: string): Promise<Record<string, Tag>> {
  const response = await fetch(`${API_BASE_URL}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tagName, color, description }),
  });
  if (!response.ok) {
    throw new Error('タグの作成に失敗しました');
  }
  return response.json();
},

// タグの削除
async deleteTag(tagName: string): Promise<Record<string, Tag>> {
  const response = await fetch(`${API_BASE_URL}/tags/${encodeURIComponent(tagName)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('タグの削除に失敗しました');
  }
  return response.json();
},
```

## フィルタリングロジック

タグによるフィルタリングは、`useTaskFilters`フックで実装されています：

```typescript
// hooks/useTaskFilters.ts
export const useTaskFilters = () => {
  // ... 他のフィルター状態 ...
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filterTasks = useCallback(
    (tasks: Task[]) => {
      return tasks.filter(task => {
        // ... 他のフィルター条件 ...
        
        // タグフィルター
        if (selectedTags.length > 0) {
          // タスクが選択されたタグのいずれかを持っているか確認
          const hasSelectedTag = task.tags?.some(tag => selectedTags.includes(tag));
          if (!hasSelectedTag) return false;
        }
        
        return true;
      });
    },
    [/* 他の依存関係 */, selectedTags]
  );

  return {
    // ... 他のフィルター関連の値と関数 ...
    selectedTags,
    setSelectedTags,
    filterTasks,
  };
};
```

## テスト戦略

タグ機能のテストは、以下のレベルで実施されています：

### 1. 単体テスト

各コンポーネントの基本機能をテスト：

```typescript
// components/tags/TagInput.test.tsx
describe('TagInput', () => {
  it('タグを追加できる', () => {
    // ...
  });
  
  it('タグを削除できる', () => {
    // ...
  });
  
  // ...
});
```

### 2. 統合テスト

複数のコンポーネントが連携する機能をテスト：

```typescript
// tests/integration/TagManagement.test.tsx
describe('タグ管理機能', () => {
  it('タグ一覧が表示される', async () => {
    // ...
  });
  
  it('新しいタグを追加できる', async () => {
    // ...
  });
  
  it('タグを削除できる', async () => {
    // ...
  });
});
```

### 3. エンドツーエンドテスト

ユーザーの視点からタグ機能全体をテスト：

```typescript
// tests/e2e/tag-workflow.spec.ts
describe('タグワークフロー', () => {
  it('タグの作成、タスクへの適用、フィルタリングができる', () => {
    // ...
  });
});
```

## まとめ

タグ機能は、TodoLogアプリケーションのタスク管理機能を大幅に強化します。複数のタグを使用することで、ユーザーはタスクをより柔軟に分類し、効率的に管理できるようになります。この実装は、React、TypeScript、およびRESTful APIの原則に従っており、拡張性と保守性を考慮して設計されています。
