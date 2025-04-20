# TodoLog APIクライアント仕様書

## 概要

TodoLogのAPIクライアントは、フロントエンドとバックエンドの通信を担当するサービスレイヤーです。RESTful APIを使用してタスク管理に必要な操作を提供します。

## 基本設定

APIクライアントは `src/services/apiClient.ts` に実装されています。

```typescript
// src/services/apiClient.ts の基本構造
import { Task, TaskCreateData, TaskUpdateData } from '../types';

const API_BASE_URL = '/api';

// エラーハンドリング用のカスタムエラークラス
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// APIリクエストの基本関数
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `API error: ${response.status}`
    );
  }

  return response.json();
}

// APIクライアントのエクスポート
const apiClient = {
  // タスク関連のメソッド
  tasks: {
    getAll: async (): Promise<Task[]> => { /* 実装 */ },
    getById: async (id: string): Promise<Task> => { /* 実装 */ },
    create: async (data: TaskCreateData): Promise<Task> => { /* 実装 */ },
    update: async (id: string, data: TaskUpdateData): Promise<Task> => { /* 実装 */ },
    delete: async (id: string): Promise<void> => { /* 実装 */ },
    toggleComplete: async (id: string): Promise<Task> => { /* 実装 */ },
    updateMemo: async (id: string, memo: string): Promise<Task> => { /* 実装 */ },
  },
  
  // カテゴリ関連のメソッド
  categories: {
    getAll: async (): Promise<string[]> => { /* 実装 */ },
  },
  
  // バックアップ関連のメソッド
  backups: {
    create: async (): Promise<{ filename: string }> => { /* 実装 */ },
    getAll: async (): Promise<string[]> => { /* 実装 */ },
    restore: async (filename: string): Promise<void> => { /* 実装 */ },
  },
  
  // エクスポート/インポート関連のメソッド
  data: {
    export: async (): Promise<Blob> => { /* 実装 */ },
    import: async (file: File): Promise<void> => { /* 実装 */ },
  },
  
  // ヘルスチェック
  health: async (): Promise<{ status: string }> => { /* 実装 */ },
};

export default apiClient;
```

## エンドポイント一覧

### タスク関連

#### タスク一覧の取得

```typescript
/**
 * すべてのタスクを取得します
 * @returns タスクの配列
 */
async getAll(): Promise<Task[]> {
  return fetchApi<Task[]>('/tasks');
}
```

**エンドポイント**: `GET /api/tasks`  
**レスポンス**: タスクオブジェクトの配列

#### 特定のタスクの取得

```typescript
/**
 * 指定されたIDのタスクを取得します
 * @param id タスクID
 * @returns タスクオブジェクト
 */
async getById(id: string): Promise<Task> {
  return fetchApi<Task>(`/tasks/${id}`);
}
```

**エンドポイント**: `GET /api/tasks/:id`  
**パラメータ**: `id` - タスクID  
**レスポンス**: タスクオブジェクト

#### 新しいタスクの作成

```typescript
/**
 * 新しいタスクを作成します
 * @param data タスク作成データ
 * @returns 作成されたタスクオブジェクト
 */
async create(data: TaskCreateData): Promise<Task> {
  return fetchApi<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

**エンドポイント**: `POST /api/tasks`  
**リクエストボディ**: タスク作成データ  
**レスポンス**: 作成されたタスクオブジェクト

#### タスクの更新

```typescript
/**
 * 指定されたIDのタスクを更新します
 * @param id タスクID
 * @param data 更新データ
 * @returns 更新されたタスクオブジェクト
 */
async update(id: string, data: TaskUpdateData): Promise<Task> {
  return fetchApi<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
```

**エンドポイント**: `PUT /api/tasks/:id`  
**パラメータ**: `id` - タスクID  
**リクエストボディ**: タスク更新データ  
**レスポンス**: 更新されたタスクオブジェクト

#### タスクの削除

```typescript
/**
 * 指定されたIDのタスクを削除します
 * @param id タスクID
 */
async delete(id: string): Promise<void> {
  await fetchApi(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
```

**エンドポイント**: `DELETE /api/tasks/:id`  
**パラメータ**: `id` - タスクID  
**レスポンス**: なし

#### タスクの完了状態の切り替え

```typescript
/**
 * 指定されたIDのタスクの完了状態を切り替えます
 * @param id タスクID
 * @returns 更新されたタスクオブジェクト
 */
async toggleComplete(id: string): Promise<Task> {
  return fetchApi<Task>(`/tasks/${id}/toggle`, {
    method: 'PUT',
  });
}
```

**エンドポイント**: `PUT /api/tasks/:id/toggle`  
**パラメータ**: `id` - タスクID  
**レスポンス**: 更新されたタスクオブジェクト

#### タスクのメモ更新

```typescript
/**
 * 指定されたIDのタスクのメモを更新します
 * @param id タスクID
 * @param memo 新しいメモ内容
 * @returns 更新されたタスクオブジェクト
 */
async updateMemo(id: string, memo: string): Promise<Task> {
  return fetchApi<Task>(`/tasks/${id}/memo`, {
    method: 'PUT',
    body: JSON.stringify({ memo }),
  });
}
```

**エンドポイント**: `PUT /api/tasks/:id/memo`  
**パラメータ**: `id` - タスクID  
**リクエストボディ**: `{ memo: string }`  
**レスポンス**: 更新されたタスクオブジェクト

### カテゴリ関連

#### カテゴリ一覧の取得

```typescript
/**
 * すべてのカテゴリを取得します
 * @returns カテゴリ名の配列
 */
async getAll(): Promise<string[]> {
  return fetchApi<string[]>('/categories');
}
```

**エンドポイント**: `GET /api/categories`  
**レスポンス**: カテゴリ名の配列

### バックアップ関連

#### バックアップの作成

```typescript
/**
 * 現在のデータのバックアップを作成します
 * @returns バックアップファイル名
 */
async create(): Promise<{ filename: string }> {
  return fetchApi<{ filename: string }>('/backups', {
    method: 'POST',
  });
}
```

**エンドポイント**: `POST /api/backups`  
**レスポンス**: `{ filename: string }`

#### バックアップ一覧の取得

```typescript
/**
 * 利用可能なバックアップファイルの一覧を取得します
 * @returns バックアップファイル名の配列
 */
async getAll(): Promise<string[]> {
  return fetchApi<string[]>('/backups');
}
```

**エンドポイント**: `GET /api/backups`  
**レスポンス**: バックアップファイル名の配列

#### バックアップからの復元

```typescript
/**
 * 指定されたバックアップファイルからデータを復元します
 * @param filename バックアップファイル名
 */
async restore(filename: string): Promise<void> {
  await fetchApi(`/backups/${filename}/restore`, {
    method: 'POST',
  });
}
```

**エンドポイント**: `POST /api/backups/:filename/restore`  
**パラメータ**: `filename` - バックアップファイル名  
**レスポンス**: なし

### エクスポート/インポート関連

#### データのエクスポート

```typescript
/**
 * タスクデータをJSONファイルとしてエクスポートします
 * @returns JSONデータを含むBlob
 */
async export(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `API error: ${response.status}`
    );
  }
  return response.blob();
}
```

**エンドポイント**: `GET /api/export`  
**レスポンス**: JSONデータを含むBlob

#### データのインポート

```typescript
/**
 * JSONファイルからタスクデータをインポートします
 * @param file インポートするJSONファイル
 */
async import(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/import`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `API error: ${response.status}`
    );
  }
}
```

**エンドポイント**: `POST /api/import`  
**リクエストボディ**: `FormData` (ファイルを含む)  
**レスポンス**: なし

### ヘルスチェック

#### サーバーの状態確認

```typescript
/**
 * サーバーの状態を確認します
 * @returns サーバーの状態情報
 */
async health(): Promise<{ status: string }> {
  return fetchApi<{ status: string }>('/health');
}
```

**エンドポイント**: `GET /api/health`  
**レスポンス**: `{ status: string }`

## エラーハンドリング

APIクライアントは、エラーハンドリングのためのカスタムエラークラス `ApiError` を提供しています。

```typescript
// APIエラーの例外処理
try {
  const tasks = await apiClient.tasks.getAll();
  // 成功時の処理
} catch (error) {
  if (error instanceof ApiError) {
    // APIエラーの処理
    console.error(`API Error ${error.status}: ${error.message}`);
    
    // ステータスコードに応じた処理
    switch (error.status) {
      case 400:
        // Bad Request
        break;
      case 401:
        // Unauthorized
        break;
      case 404:
        // Not Found
        break;
      case 500:
        // Internal Server Error
        break;
      default:
        // その他のエラー
        break;
    }
  } else {
    // ネットワークエラーなどのその他のエラー
    console.error('Unexpected error:', error);
  }
}
```

## キャッシュ戦略

APIクライアントは、パフォーマンス向上のためにシンプルなキャッシュ機構を実装しています。

```typescript
// キャッシュの実装例
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1分間キャッシュを有効にする

async function fetchWithCache<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache = true
): Promise<T> {
  const cacheKey = `${options.method || 'GET'}:${endpoint}`;
  
  // キャッシュが有効で、キャッシュにデータがある場合
  if (
    useCache &&
    options.method === 'GET' &&
    cache.has(cacheKey)
  ) {
    const cachedData = cache.get(cacheKey)!;
    
    // キャッシュが有効期限内であれば、キャッシュからデータを返す
    if (Date.now() - cachedData.timestamp < CACHE_TTL) {
      return cachedData.data;
    }
  }
  
  // APIリクエストを実行
  const data = await fetchApi<T>(endpoint, options);
  
  // GETリクエストの場合、結果をキャッシュに保存
  if (options.method === 'GET' || !options.method) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  } else {
    // 変更を伴うリクエストの場合、関連するキャッシュを無効化
    for (const key of cache.keys()) {
      if (key.includes(endpoint.split('/')[1])) {
        cache.delete(key);
      }
    }
  }
  
  return data;
}
```

## 使用例

### タスク一覧の取得と表示

```typescript
import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Task } from '../types';

function TaskListComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await apiClient.tasks.getAll();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError('タスクの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      <h2>タスク一覧</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 新しいタスクの作成

```typescript
import { useState } from 'react';
import apiClient from '../services/apiClient';
import { TaskCreateData } from '../types';

function CreateTaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('タイトルは必須です');
      return;
    }
    
    const taskData: TaskCreateData = {
      title,
      priority: priority as 'high' | 'medium' | 'low',
    };
    
    try {
      setSubmitting(true);
      const newTask = await apiClient.tasks.create(taskData);
      setTitle('');
      setPriority('medium');
      setError(null);
      onTaskCreated(newTask);
    } catch (err) {
      setError('タスクの作成に失敗しました');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          タイトル:
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={submitting}
          />
        </label>
      </div>
      
      <div>
        <label>
          優先度:
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            disabled={submitting}
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </label>
      </div>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <button type="submit" disabled={submitting}>
        {submitting ? '作成中...' : 'タスクを作成'}
      </button>
    </form>
  );
}
```

### カスタムフックでのAPI利用

```typescript
import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { Task, TaskCreateData, TaskUpdateData } from '../types';

export function useTaskActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await apiClient.tasks.getAll();
      return tasks;
    } catch (err) {
      setError('タスクの取得に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: TaskCreateData) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await apiClient.tasks.create(taskData);
      return newTask;
    } catch (err) {
      setError('タスクの作成に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: string, taskData: TaskUpdateData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await apiClient.tasks.update(id, taskData);
      return updatedTask;
    } catch (err) {
      setError('タスクの更新に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.tasks.delete(id);
    } catch (err) {
      setError('タスクの削除に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleTaskComplete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await apiClient.tasks.toggleComplete(id);
      return updatedTask;
    } catch (err) {
      setError('タスクの状態変更に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
}
```

## 型定義

APIクライアントで使用される主要な型定義は以下の通りです。

```typescript
// src/types/index.ts

// タスクの優先度
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  memo?: string;
}

// タスク作成時のデータ型
export interface TaskCreateData {
  title: string;
  priority: Priority;
  category?: string;
  dueDate?: string;
  memo?: string;
}

// タスク更新時のデータ型
export interface TaskUpdateData {
  title?: string;
  completed?: boolean;
  priority?: Priority;
  category?: string;
  dueDate?: string;
  memo?: string;
}

// タスクフィルタリング条件の型
export interface TaskFilter {
  completed?: boolean;
  priority?: Priority;
  category?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

// ソートオプションの型
export interface SortOption {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}
```

## まとめ

TodoLogのAPIクライアントは、フロントエンドとバックエンドの通信を抽象化し、型安全なインターフェースを提供します。エラーハンドリングとキャッシュ機構を備え、効率的なデータ取得と操作を可能にします。

APIクライアントを使用することで、コンポーネントはデータの取得と表示に集中でき、ビジネスロジックとデータアクセスの関心を分離することができます。
