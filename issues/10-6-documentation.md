# Issue10 フェーズ6: ドキュメントとコードスタイルの統一

## 概要

コードベース全体のドキュメントを更新し、コードスタイルを統一します。これにより、コードの可読性と保守性を向上させ、新しい開発者がプロジェクトに参加しやすくなります。

## 実施内容

### 1. コメントの見直し

#### 対象ファイル

- すべてのソースファイル

#### 実装方針

1. 古いコメントの更新または削除
2. 複雑なロジックへの適切なコメント追加
3. JSDoc形式のコメントの統一

```typescript
/**
 * タスクの優先度を表す列挙型
 */
export enum Priority {
  /** 高優先度 */
  High = 'high',
  /** 中優先度 */
  Medium = 'medium',
  /** 低優先度 */
  Low = 'low',
}

/**
 * タスクを表すインターフェース
 */
export interface Task {
  /** タスクの一意識別子 */
  id: string;
  /** タスクのタイトル */
  title: string;
  /** タスクの完了状態 */
  completed: boolean;
  /** タスクの優先度 */
  priority: Priority;
  /** タスクに関連付けられたタグ（オプション） */
  tags?: string[];
  /** タスクの期限（ISO形式の文字列、オプション） */
  dueDate?: string;
  /** タスクの作成日時（ISO形式の文字列） */
  createdAt: string;
  /** タスクの最終更新日時（ISO形式の文字列） */
  updatedAt: string;
  /** タスクに関連付けられたメモ（オプション） */
  memo?: string;
}
```

### 2. コードスタイルの統一

#### 対象ファイル

- すべてのソースファイル

#### 実装方針

1. 命名規則の統一
2. ファイル構造の整理
3. インポート順序の統一

```typescript
// 命名規則の例
// コンポーネント: PascalCase
// 関数: camelCase
// 定数: UPPER_SNAKE_CASE
// 型: PascalCase
// インターフェース: PascalCase（接頭辞 I なし）
// 列挙型: PascalCase

// インポート順序の例
// 1. React関連
// 2. サードパーティライブラリ
// 3. 自作コンポーネント
// 4. 自作フック
// 5. 自作ユーティリティ
// 6. 型定義
// 7. アセット（CSS、画像など）

// 例
import type React from 'react';
import { useState, useEffect, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import Button from '../components/ui/Button';
import TaskList from '../components/TaskList';

import { useTaskContext } from '../contexts/TaskContext';
import { useNotification } from '../hooks/useNotification';

import { formatDate } from '../utils/dateUtils';
import { validateTask } from '../utils/validationUtils';

import { Task, Priority } from '../types';

import './HomePage.css';
```

### 3. ドキュメントの更新

#### 対象ファイル

- `README.md`
- `CONTRIBUTING.md`（新規作成）
- `API.md`（新規作成）
- `ARCHITECTURE.md`（新規作成）

#### 実装方針

1. READMEの更新
2. 開発者向けドキュメントの作成
3. APIドキュメントの作成
4. アーキテクチャドキュメントの作成

```markdown
<!-- CONTRIBUTING.md の例 -->
# 開発者向けガイド

## 開発環境のセットアップ

### 必要条件
- Node.js 18.x 以上
- npm 8.x 以上

### インストール手順
1. リポジトリをクローン: `git clone https://github.com/yourusername/todolog.git`
2. 依存関係のインストール: `npm run install:all`
3. 開発サーバーの起動: `npm run dev`

## コーディング規約

### 命名規則
- **コンポーネント**: PascalCase（例: `TaskItem.tsx`）
- **関数**: camelCase（例: `formatDate`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_TASKS`）
- **型**: PascalCase（例: `Task`）
- **ファイル名**: コンポーネントはPascalCase、それ以外はcamelCase

### ディレクトリ構造
- `src/components`: UIコンポーネント
- `src/hooks`: カスタムフック
- `src/contexts`: Reactコンテキスト
- `src/utils`: ユーティリティ関数
- `src/types`: 型定義
- `src/services`: APIクライアント
- `src/pages`: ページコンポーネント

### コミットメッセージ
コミットメッセージは以下の形式に従ってください：
```
<type>: <subject>

<body>
```

typeは以下のいずれかを使用します：
- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメントのみの変更
- **style**: コードの意味に影響しない変更（空白、フォーマットなど）
- **refactor**: バグ修正でも機能追加でもないコード変更
- **test**: テストの追加・修正
- **chore**: ビルドプロセスやツールの変更

## テスト

### テストの実行
- すべてのテストを実行: `npm test`
- フロントエンドのテストを実行: `npm run client:test`
- バックエンドのテストを実行: `npm run server:test`

### テスト作成のガイドライン
- コンポーネントには少なくとも基本的なレンダリングテストを作成する
- ユーティリティ関数には単体テストを作成する
- 複雑なロジックには複数のテストケースを作成する

## プルリクエスト

プルリクエストを作成する前に以下を確認してください：
1. すべてのテストが通過していること
2. コードスタイルが統一されていること
3. 新しい機能には適切なテストが追加されていること
4. ドキュメントが更新されていること
```

```markdown
<!-- ARCHITECTURE.md の例 -->
# アーキテクチャ概要

## 全体構成

TodoLogは、フロントエンドとバックエンドが分離されたアーキテクチャを採用しています：

- **フロントエンド**: React + TypeScript（Viteでビルド）
- **バックエンド**: Node.js + Express + TypeScript
- **データ永続化**: ファイルシステム（JSON形式）

## フロントエンドアーキテクチャ

### コンポーネント階層

```
App
├── MainLayout
│   ├── Navbar
│   ├── Sidebar
│   └── Content
│       ├── HomePage
│       │   ├── TaskQuickAdd
│       │   ├── TaskFilterBar
│       │   └── TaskList
│       │       └── TaskItem
│       ├── TaskDetailPage
│       │   ├── TaskHeader
│       │   ├── TaskMetadata
│       │   └── TaskMemoEditor
│       ├── SettingsPage
│       └── TagManagementPage
└── NotificationContainer
```

### 状態管理

- **TaskContext**: タスク関連の状態を管理
- **SettingsContext**: アプリケーション設定を管理
- **NotificationContext**: 通知を管理

### データフロー

1. ユーザーアクション（例：タスク作成）
2. コンテキストのアクションディスパッチ
3. APIリクエスト
4. 状態の更新
5. UIの再レンダリング

## バックエンドアーキテクチャ

### レイヤー構造

- **ルーティング層**: リクエストのルーティング
- **コントローラー層**: リクエスト処理とレスポンス生成
- **サービス層**: ビジネスロジック
- **データアクセス層**: データの永続化

### データモデル

主要なエンティティ：
- **Task**: タスク情報
- **Tag**: タグ情報
- **Backup**: バックアップ情報

### エラーハンドリング

- カスタムエラークラス
- 集中型エラーハンドリングミドルウェア
- 構造化されたエラーレスポンス

## API設計

RESTful APIの原則に従い、以下のエンドポイントを提供：

- `/api/tasks`: タスク管理
- `/api/tags`: タグ管理
- `/api/backups`: バックアップ管理
- `/api/export`, `/api/import`: データのエクスポート/インポート

## セキュリティ

- CORS設定
- レート制限
- 入力バリデーション
- エラーメッセージのサニタイズ

## パフォーマンス最適化

- フロントエンド: メモ化、コード分割、遅延ロード
- バックエンド: キャッシュ、クエリ最適化
```

### 4. APIドキュメントの作成

#### 対象ファイル

- `API.md`（新規作成）

#### 実装方針

1. 各エンドポイントの詳細な説明
2. リクエスト/レスポンスの例
3. エラーコードの説明

```markdown
<!-- API.md の例 -->
# API仕様書

## 基本情報

- ベースURL: `/api`
- レスポンス形式: JSON
- 認証: なし（ローカルアプリケーション）

## エンドポイント一覧

### タスク管理

#### タスク一覧の取得

```
GET /tasks
```

**クエリパラメータ**:
- `completed`: 完了状態でフィルタリング（オプション、`true`または`false`）
- `priority`: 優先度でフィルタリング（オプション、`high`、`medium`、`low`）
- `tags`: タグでフィルタリング（オプション、カンマ区切りの文字列）
- `search`: 検索キーワード（オプション）
- `sort`: ソート順（オプション、`createdAt`、`updatedAt`、`dueDate`、`priority`）
- `order`: ソート方向（オプション、`asc`または`desc`、デフォルトは`desc`）

**レスポンス例**:
```json
[
  {
    "id": "5fffa411-5c27-4745-9d90-afd19fc69462",
    "title": "買い物リストを作成する",
    "completed": false,
    "priority": "medium",
    "tags": ["買い物", "家事"],
    "dueDate": "2025-05-01T00:00:00.000Z",
    "createdAt": "2025-04-20T10:30:00.000Z",
    "updatedAt": "2025-04-20T10:30:00.000Z"
  },
  // 他のタスク...
]
```

#### 特定のタスクの取得

```
GET /tasks/:id
```

**パスパラメータ**:
- `id`: タスクID

**レスポンス例**:
```json
{
  "id": "5fffa411-5c27-4745-9d90-afd19fc69462",
  "title": "買い物リストを作成する",
  "completed": false,
  "priority": "medium",
  "tags": ["買い物", "家事"],
  "dueDate": "2025-05-01T00:00:00.000Z",
  "createdAt": "2025-04-20T10:30:00.000Z",
  "updatedAt": "2025-04-20T10:30:00.000Z",
  "memo": "牛乳、卵、パン、野菜を買う"
}
```

#### 新しいタスクの作成

```
POST /tasks
```

**リクエスト本文**:
```json
{
  "title": "新しいタスク",
  "priority": "high",
  "tags": ["仕事", "重要"],
  "dueDate": "2025-05-10T00:00:00.000Z",
  "memo": "詳細なメモ"
}
```

**レスポンス例**:
```json
{
  "id": "7890abcd-ef12-3456-7890-abcdef123456",
  "title": "新しいタスク",
  "completed": false,
  "priority": "high",
  "tags": ["仕事", "重要"],
  "dueDate": "2025-05-10T00:00:00.000Z",
  "createdAt": "2025-04-26T15:45:00.000Z",
  "updatedAt": "2025-04-26T15:45:00.000Z",
  "memo": "詳細なメモ"
}
```

// 他のエンドポイントの説明...
```

## 実装計画

1. コメントの見直し
2. コードスタイルの統一
3. READMEの更新
4. 開発者向けドキュメントの作成
5. APIドキュメントの作成
6. アーキテクチャドキュメントの作成

## 成果物

- 更新されたコメント
- 統一されたコードスタイル
- 更新されたREADME
- 新しい開発者向けドキュメント
- 新しいAPIドキュメント
- 新しいアーキテクチャドキュメント

## 評価基準

- ドキュメントの完全性
- ドキュメントの正確性
- コードスタイルの一貫性
- 新しい開発者にとっての理解しやすさ

## 進捗状況

### 計画中の作業
- [ ] コメントの見直し
  - [ ] 古いコメントの更新または削除
  - [ ] 複雑なロジックへの適切なコメント追加
  - [ ] JSDoc形式のコメントの統一
- [ ] コードスタイルの統一
  - [ ] 命名規則の統一
  - [ ] ファイル構造の整理
  - [ ] インポート順序の統一
- [ ] ドキュメントの更新
  - [ ] READMEの更新
  - [ ] CONTRIBUTING.mdの作成
  - [ ] API.mdの作成
  - [ ] ARCHITECTURE.mdの作成

## 実装スケジュール

- コメントの見直し: 2025-05-02
- コードスタイルの統一: 2025-05-02
- READMEの更新: 2025-05-02
- 開発者向けドキュメントの作成: 2025-05-02
- APIドキュメントの作成: 2025-05-02
- アーキテクチャドキュメントの作成: 2025-05-02
