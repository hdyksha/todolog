# TodoLog - タスク管理アプリケーション

## 概要

TodoLogは、シンプルで使いやすいタスク管理アプリケーションです。各タスクにメモを追加する機能を備え、データはローカルファイルに保存されるため、可搬性と利便性を両立しています。

## 開発状況

- ✅ Issue01: フロントエンドとバックエンドの分離 (2025-04-18完了)
- ⬜ Issue02: バックエンド実装
  - ✅ フェーズ1: プロジェクト構造とベース実装 (2025-04-18完了)
  - ✅ フェーズ2: データ永続化レイヤーの実装 (2025-04-18完了)
  - ✅ フェーズ3: APIエンドポイントの実装（基本機能）(2025-04-18完了)
  - ✅ フェーズ4: APIエンドポイントの実装（拡張機能）(2025-04-18完了)
  - ✅ フェーズ5: セキュリティと最適化 (2025-04-18完了)
  - ⬜ フェーズ6: テストとドキュメント

詳細は [CHANGELOG.md](./CHANGELOG.md) を参照してください。

## 機能要件

### 基本機能
- タスクの作成、表示、編集、削除（CRUD操作）
- タスクへのメモ追加機能
- タスクの完了状態の切り替え
- タスクの優先度設定
- タスクのカテゴリ分け
- タスクの期限設定

### データ永続化
- バックエンドでのJSON形式でのファイル保存
- アプリ起動時の自動データロード
- データ変更時の自動保存
- エクスポート/インポート機能

## 技術スタック

### フロントエンド
- **ライブラリ**: React
- **言語**: TypeScript
- **ビルドツール**: Vite
- **リンター/フォーマッター**: Biome
- **テスト**: Vitest + React Testing Library

### バックエンド
- **ランタイム**: Node.js
- **フレームワーク**: Express
- **言語**: TypeScript
- **データ永続化**: ファイルシステム (fs/promises)
- **ロギング**: Winston
- **バリデーション**: Zod

## アーキテクチャ

TodoLogは、フロントエンドとバックエンドが分離されたアーキテクチャを採用しています：

- **フロントエンド**: ブラウザで動作するReactアプリケーション
- **バックエンド**: Node.js + Expressで実装されたAPIサーバー
- **通信**: RESTful API

この構成により、ブラウザ環境でも動作し、かつファイルシステムを使ったデータ永続化も実現しています。

## 実行方法

### 初回セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/todolog.git
cd todolog

# 依存関係のインストール（フロントエンドとバックエンド両方）
npm run install:all
```

### 開発環境の起動

```bash
# 開発サーバーの起動（フロントエンドとバックエンド両方）
npm run dev

# フロントエンドのみ起動
npm run client:dev

# バックエンドのみ起動
npm run server:dev
```

### ビルドと実行

```bash
# プロダクションビルド
npm run build

# バックエンドサーバーの起動
npm run start
```

## プロジェクト構造

```
todolog/
├── client/             # フロントエンド
│   ├── public/
│   ├── src/
│   │   ├── components/ # UIコンポーネント
│   │   ├── hooks/      # カスタムフック
│   │   ├── services/   # APIクライアント
│   │   ├── types/      # 型定義
│   │   └── ...
│   └── ...
├── server/             # バックエンド
│   ├── src/
│   │   ├── config/     # 設定ファイル
│   │   ├── controllers/ # APIコントローラー
│   │   ├── middleware/ # ミドルウェア
│   │   ├── models/     # データモデル
│   │   ├── routes/     # APIルート
│   │   ├── services/   # ビジネスロジック
│   │   ├── types/      # 型定義
│   │   ├── utils/      # ユーティリティ
│   │   └── ...
│   └── ...
└── ...
```

## APIエンドポイント

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | /api/tasks | タスク一覧の取得 |
| GET | /api/tasks/:id | 特定のタスクの取得 |
| POST | /api/tasks | 新しいタスクの作成 |
| PUT | /api/tasks/:id | タスクの更新 |
| DELETE | /api/tasks/:id | タスクの削除 |
| PUT | /api/tasks/:id/toggle | タスクの完了状態の切り替え |
| PUT | /api/tasks/:id/memo | タスクのメモ更新 |
| GET | /api/categories | カテゴリ一覧の取得 |
| POST | /api/backups | バックアップの作成 |
| GET | /api/backups | バックアップ一覧の取得 |
| POST | /api/backups/:filename/restore | バックアップからの復元 |
| GET | /api/export | タスクデータのエクスポート |
| POST | /api/import | タスクデータのインポート |
| GET | /health | ヘルスチェック |

## データモデル

```typescript
// タスクの型定義
interface Task {
  id: string;          // ユニークID
  title: string;       // タスクのタイトル
  completed: boolean;  // 完了状態
  priority: Priority;  // 優先度（High, Medium, Low）
  category?: string;   // カテゴリ（オプション）
  dueDate?: string;    // 期限（ISO形式の文字列）
  createdAt: string;   // 作成日時（ISO形式の文字列）
  updatedAt: string;   // 更新日時（ISO形式の文字列）
  memo?: string;       // メモ（オプション）
}

// 優先度の型定義
enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}
```

## 環境設定

バックエンドの環境変数は `.env` ファイルで設定できます。サンプルとして `.env.example` を参照してください。

```
# サーバーポート
PORT=3001

# データディレクトリ
DATA_DIR=./data

# 環境
NODE_ENV=development

# ログレベル
LOG_LEVEL=info
```

## 注意事項

このアプリケーションは開発中であり、機能やAPIは変更される可能性があります。
