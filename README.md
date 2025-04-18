# TodoLog - タスク管理アプリケーション

## 概要

TodoLogは、シンプルで使いやすいタスク管理アプリケーションです。各タスクにメモを追加する機能を備え、データはローカルファイルに保存されるため、可搬性と利便性を両立しています。

## 機能要件

### 基本機能
- タスクの作成、表示、編集、削除（CRUD操作）
- タスクへのメモ追加機能
- タスクの完了状態の切り替え
- タスクの優先度設定
- タスクのカテゴリ分け
- タスクの期限設定

### データ永続化
- ローカルファイルシステムへのJSON形式での保存
- アプリ起動時の自動データロード
- データ変更時の自動保存
- エクスポート/インポート機能

## 技術スタック

- **フロントエンド**: React + TypeScript
- **ビルドツール**: Vite
- **リンター/フォーマッター**: Biome
- **テスト**: Vitest + React Testing Library
- **ファイル操作**: Node.js fs/promises API

## 実行方法

### 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ビルドと実行

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

### テスト実行

```bash
# テストの実行
npm test

# カバレッジレポートの生成
npm run coverage
```

## 注意事項

このアプリケーションはElectronやNode.js環境で実行することを前提としています。ブラウザ環境では、ファイルシステムへのアクセス制限があるため、データの永続化機能は動作しません。

## アプリケーション設計

### データモデル

```typescript
// タスクの型定義
interface Task {
  id: string;          // ユニークID
  title: string;       // タスクのタイトル
  completed: boolean;  // 完了状態
  priority: Priority;  // 優先度（High, Medium, Low）
  category?: string;   // カテゴリ（オプション）
  dueDate?: Date;      // 期限（オプション）
  createdAt: Date;     // 作成日時
  updatedAt: Date;     // 更新日時
  memo?: string;       // メモ（オプション）
}

// 優先度の型定義
enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}
```

### コンポーネント構造

```
src/
├── components/
│   ├── TaskList.tsx          # タスク一覧表示
│   ├── TaskItem.tsx          # 個別タスク表示
│   ├── TaskForm.tsx          # タスク作成/編集フォーム
│   ├── TaskFilter.tsx        # タスクフィルター
│   ├── MemoEditor.tsx        # メモ編集コンポーネント
│   └── CategoryManager.tsx   # カテゴリ管理
├── hooks/
│   ├── useTasks.ts           # タスク操作のカスタムフック
│   └── useFileStorage.ts     # ファイル永続化のカスタムフック
├── services/
│   └── fileService.ts        # ファイル操作サービス
├── store/
│   └── taskStore.ts          # タスク状態管理
├── types/
│   └── index.ts              # 型定義
└── utils/
    └── helpers.ts            # ユーティリティ関数
```

### ファイル永続化の実装

```typescript
// fileService.ts
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = 'todolog-data.json';
const DATA_PATH = path.join(process.env.HOME || process.env.USERPROFILE || '.', DATA_FILE);

export async function saveData<T>(data: T): Promise<void> {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
    throw error;
  }
}

export async function loadData<T>(): Promise<T | null> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    // ファイルが存在しない場合は null を返す
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    console.error('データの読み込みに失敗しました:', error);
    throw error;
  }
}

export async function exportData(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('データのエクスポートに失敗しました:', error);
    throw error;
  }
}

export async function importData<T>(filePath: string): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('データのインポートに失敗しました:', error);
    throw error;
  }
}
```

### カスタムフックの実装例

```typescript
// useTasks.ts
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, Priority } from '../types';
import { saveData, loadData } from '../services/fileService';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 初期データのロード
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await loadData<Task[]>();
        setTasks(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // データ変更時の保存
  useEffect(() => {
    if (!loading) {
      saveData(tasks).catch(err => {
        setError(err instanceof Error ? err : new Error('Failed to save tasks'));
      });
    }
  }, [tasks, loading]);

  // タスク追加
  const addTask = (title: string, priority: Priority = Priority.Medium, category?: string, dueDate?: Date, memo?: string) => {
    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      priority,
      category,
      dueDate,
      memo,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // タスク更新
  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() } 
          : task
      )
    );
  };

  // タスク削除
  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // タスク完了状態の切り替え
  const toggleTaskCompletion = (id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { ...task, completed: !task.completed, updatedAt: new Date() } 
          : task
      )
    );
  };

  // メモの更新
  const updateMemo = (id: string, memo: string) => {
    updateTask(id, { memo });
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateMemo
  };
}
```

## 開発ロードマップ

### フェーズ1: 基本機能の実装
1. プロジェクト初期設定（Vite + React + TypeScript）
2. データモデルとタイプの定義
3. ファイル永続化サービスの実装
4. 基本的なタスク操作（CRUD）の実装
5. シンプルなUIの構築

### フェーズ2: 機能拡張
1. メモ機能の実装
2. タスクのフィルタリングと並べ替え
3. カテゴリ管理機能
4. 優先度と期限の設定

### フェーズ3: UX改善とテスト
1. UIの改善とレスポンシブデザイン
2. ユーザー設定の保存
3. エクスポート/インポート機能
4. 単体テストと統合テストの実装

### フェーズ4: 追加機能
1. タスクの繰り返し設定
2. 通知機能
3. データバックアップ
4. テーマカスタマイズ

## 開発環境のセットアップ

```bash
# プロジェクト作成
npm create vite@latest todolog -- --template react-ts

# 依存関係のインストール
cd todolog
npm install

# 追加パッケージのインストール
npm install uuid
npm install -D @types/uuid

# Biomeのセットアップ
npm install -D @biomejs/biome

# Vitestのセットアップ
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 開発サーバーの起動
npm run dev
```

## テスト戦略

1. **単体テスト**: 各コンポーネントとカスタムフックの機能テスト
2. **統合テスト**: コンポーネント間の連携テスト
3. **E2Eテスト**: ユーザーフローのテスト

## ベストプラクティス

- TypeScriptの厳格なタイプチェックを有効化
- コンポーネントの責任分離を徹底
- カスタムフックによるロジックの分離
- テスト駆動開発（TDD）の採用
- アクセシビリティへの配慮
- エラーハンドリングの徹底

## 今後の拡張性

- クラウドストレージとの同期機能
- チーム共有機能
- モバイルアプリ対応
- オフライン対応
