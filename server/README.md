# TodoLog バックエンド

TodoLogアプリケーションのバックエンドサーバーです。Express.jsとTypeScriptで実装されており、タスク管理のためのRESTful APIを提供します。

## 機能

- タスクの作成、取得、更新、削除（CRUD操作）
- タスクの完了状態の切り替え
- タスクへのメモ追加
- カテゴリ管理
- バックアップと復元
- データのエクスポート/インポート

## 技術スタック

- **ランタイム**: Node.js
- **フレームワーク**: Express
- **言語**: TypeScript
- **データ永続化**: ファイルシステム (fs/promises)
- **ロギング**: Winston
- **バリデーション**: Zod
- **テスト**: Vitest

## プロジェクト構造

```
server/
├── src/
│   ├── config/       # 設定ファイル
│   ├── controllers/  # APIコントローラー
│   ├── middleware/   # ミドルウェア
│   ├── models/       # データモデル
│   ├── routes/       # APIルート
│   ├── services/     # ビジネスロジック
│   ├── types/        # 型定義
│   ├── utils/        # ユーティリティ
│   ├── app.ts        # Expressアプリケーション
│   ├── index.ts      # エントリーポイント
│   └── server.ts     # HTTPサーバー
├── tests/
│   ├── integration/  # 統合テスト
│   ├── unit/         # 単体テスト
│   └── example.test.ts
├── .env.example      # 環境変数のサンプル
├── package.json
├── tsconfig.json
└── README.md
```

## セットアップ

### 前提条件

- Node.js 18.x以上
- npm 9.x以上

### インストール

```bash
# 依存関係のインストール
npm install
```

### 環境変数の設定

`.env.example`ファイルを`.env`にコピーし、必要に応じて設定を変更します。

```bash
cp .env.example .env
```

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

サーバーは`http://localhost:3001`で起動します（環境変数で変更可能）。

### ビルド

```bash
npm run build
```

ビルドされたファイルは`dist`ディレクトリに出力されます。

### 本番環境での実行

```bash
npm run start
```

## テスト

### テストの実行

```bash
# すべてのテストを実行
npm test

# 単体テストのみ実行
npm run test:unit

# 統合テストのみ実行
npm run test:integration

# テストカバレッジの確認
npm run test:coverage
```

### テスト構造

- **単体テスト**: 個々のコンポーネント（サービス、コントローラーなど）を分離してテスト
- **統合テスト**: 複数のコンポーネントの連携や、APIエンドポイントの動作をテスト

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

## 命名規則

- **ファイル名**: キャメルケース（例: `taskService.ts`, `errorHandler.ts`）
- **クラス名**: パスカルケース（例: `TaskService`, `FileService`）
- **関数名**: キャメルケース（例: `createTask`, `getAllTasks`）
- **変数名**: キャメルケース（例: `taskData`, `userId`）
- **定数**: 大文字のスネークケース（例: `MAX_TASKS`, `DEFAULT_PORT`）

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
