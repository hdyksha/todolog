# TodoLog 開発者ドキュメント

## アーキテクチャ概要

TodoLogは、フロントエンドとバックエンドが分離されたアーキテクチャを採用しています：

- **フロントエンド**: React + TypeScript（Viteでビルド）
- **バックエンド**: Node.js + Express + TypeScript

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│  フロントエンド  │ <──> │  バックエンド  │ <──> │  ファイル    │
│  (React)    │      │  (Express)  │      │  システム    │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

### バックエンドの構造

バックエンドは以下のレイヤーで構成されています：

1. **ルーティング層**: リクエストのルーティングを担当
2. **コントローラー層**: リクエスト処理とレスポンス生成を担当
3. **サービス層**: ビジネスロジックを担当
4. **データアクセス層**: データの永続化を担当

```
┌─────────────┐
│  クライアント  │
└──────┬──────┘
       │
┌──────▼──────┐
│  ミドルウェア  │ ← 認証、ロギング、レート制限、キャッシュ制御など
└──────┬──────┘
       │
┌──────▼──────┐
│  ルーティング  │ ← リクエストを適切なコントローラーに振り分け
└──────┬──────┘
       │
┌──────▼──────┐
│ コントローラー │ ← リクエスト処理、バリデーション、レスポンス生成
└──────┬──────┘
       │
┌──────▼──────┐
│  サービス    │ ← ビジネスロジック、データ操作
└──────┬──────┘
       │
┌──────▼──────┐
│ データアクセス │ ← ファイルシステムへのアクセス
└─────────────┘
```

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/todolog.git
cd todolog

# 依存関係のインストール（フロントエンドとバックエンド両方）
npm run install:all

# 開発サーバーの起動
npm run dev
```

### 環境変数

バックエンドの環境変数は `.env` ファイルで設定します。`.env.example` をコピーして `.env` を作成してください：

```bash
cp server/.env.example server/.env
```

主な環境変数：

| 変数名 | 説明 | デフォルト値 |
|-------|------|------------|
| PORT | サーバーのポート番号 | 3001 |
| DATA_DIR | データファイルの保存ディレクトリ | ./data |
| NODE_ENV | 実行環境（development, test, production） | development |
| LOG_LEVEL | ログレベル（debug, info, warn, error） | info |

## プロジェクト構造

```
todolog/
├── client/             # フロントエンド
│   ├── public/         # 静的ファイル
│   ├── src/            # ソースコード
│   │   ├── components/ # UIコンポーネント
│   │   ├── hooks/      # カスタムフック
│   │   ├── services/   # APIクライアント
│   │   ├── types/      # 型定義
│   │   └── ...
│   └── ...
├── server/             # バックエンド
│   ├── src/            # ソースコード
│   │   ├── config/     # 設定ファイル
│   │   ├── controllers/ # APIコントローラー
│   │   ├── middleware/ # ミドルウェア
│   │   ├── models/     # データモデル
│   │   ├── routes/     # APIルート
│   │   ├── services/   # ビジネスロジック
│   │   ├── types/      # 型定義
│   │   ├── utils/      # ユーティリティ
│   │   └── ...
│   ├── data/           # データファイル（.gitignore対象）
│   ├── docs/           # ドキュメント
│   └── tests/          # テスト
│       ├── unit/       # 単体テスト
│       ├── integration/ # 統合テスト
│       └── ...
└── ...
```

## コーディング規約

### 全般

- TypeScriptの厳格モード（strict mode）を使用
- ESLintとPrettierを使用してコードスタイルを統一
- ファイル名はキャメルケース（例: `taskService.ts`）
- クラス名はパスカルケース（例: `TaskService`）
- 関数名と変数名はキャメルケース（例: `getAllTasks`）
- 定数名は大文字のスネークケース（例: `MAX_RETRY_COUNT`）

### TypeScript

- 型推論に頼らず、明示的な型定義を使用
- `any` 型の使用を避け、代わりに `unknown` を使用
- インターフェースとタイプエイリアスを適切に使い分け
- ジェネリクスを活用して再利用可能なコードを作成
- nullableな値には必ず型ガードを使用

### バックエンド

- コントローラーはリクエスト処理とレスポンス生成のみを担当
- ビジネスロジックはサービス層に実装
- データアクセスはサービス層から直接行う
- エラーハンドリングは一貫した方法で行う
- 非同期処理には async/await を使用
- ログ出力は適切なログレベルで行う

## テスト

### テストの種類

- **単体テスト**: 個々の関数やクラスをテスト
- **統合テスト**: 複数のコンポーネントの連携をテスト
- **APIテスト**: エンドポイントの動作をテスト

### テストツール

- **テストフレームワーク**: Vitest
- **モック**: Vitest組み込みのモック機能
- **カバレッジ**: c8

### テスト実行

```bash
# すべてのテストを実行
cd server
npm test

# 単体テストのみ実行
npm run test:unit

# 統合テストのみ実行
npm run test:integration

# カバレッジレポートの生成
npm run test:coverage
```

## デバッグ

### ログ出力

バックエンドでは Winston ロガーを使用しています。ログレベルは環境変数 `LOG_LEVEL` で設定できます。

```typescript
import { logger } from '../utils/logger';

// 各ログレベルの使用例
logger.debug('デバッグ情報');
logger.info('情報メッセージ');
logger.warn('警告メッセージ');
logger.error('エラーメッセージ', { error: err });
```

### デバッグモード

Node.jsのデバッグモードを使用してデバッグできます：

```bash
# デバッグモードでサーバーを起動
cd server
npm run debug
```

VSCodeでデバッグする場合は、`.vscode/launch.json` に設定が用意されています。

## デプロイ

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果の確認
npm run preview
```

### 本番環境

本番環境では以下の設定を推奨します：

- NODE_ENV=production
- LOG_LEVEL=info
- プロセスマネージャー（PM2など）の使用
- リバースプロキシ（Nginx/Apache）の設定
- HTTPS の有効化

## パフォーマンス最適化

### バックエンド

- キャッシュ制御ヘッダーの活用
- ETags によるキャッシュ検証
- レート制限の適切な設定
- 大きなレスポンスの圧縮
- 非同期処理の適切な使用

## セキュリティ対策

- Helmet ミドルウェアによるセキュリティヘッダーの設定
- CORS の適切な設定
- 入力値の厳格なバリデーション
- レート制限によるDDoS対策
- 適切なエラーハンドリングによる情報漏洩の防止

## 貢献ガイドライン

1. 機能追加やバグ修正は新しいブランチで作業
2. コミットメッセージは明確に記述
3. プルリクエスト前にテストを実行
4. コードレビューを経てからマージ

## トラブルシューティング

### よくある問題

1. **サーバーが起動しない**
   - ポートが既に使用されていないか確認
   - 環境変数が正しく設定されているか確認
   - 依存関係が正しくインストールされているか確認

2. **データが保存されない**
   - DATA_DIR が正しく設定されているか確認
   - ディレクトリの書き込み権限を確認

3. **テストが失敗する**
   - モックの設定が正しいか確認
   - 環境変数 NODE_ENV=test が設定されているか確認

## API リファレンス

詳細なAPI仕様については、[API ドキュメント](./README.md)および[OpenAPI仕様書](./openapi.yaml)を参照してください。
## カスタムストレージロケーション機能

TodoLogアプリケーションでは、タスクデータの保存先をカスタマイズできる機能を提供しています。この機能により、ユーザーは任意のディレクトリにタスクデータを保存し、複数のタスクファイルを管理できます。

### 設計概要

カスタムストレージロケーション機能は、以下のコンポーネントで構成されています：

1. **設定サービス（SettingsService）**
   - ユーザー設定を管理するサービス
   - データディレクトリやタスクファイル名などの設定を保存・読み込み

2. **ファイルサービス（FileService）**
   - 指定されたディレクトリにファイルを作成・読み込み・保存
   - ディレクトリが存在しない場合の自動作成

3. **ディレクトリコントローラー（DirectoryController）**
   - 利用可能なディレクトリ一覧を提供
   - ディレクトリの存在確認と書き込み権限チェック

4. **ストレージコントローラー（StorageController）**
   - タスクファイルの作成・管理
   - ファイル名のバリデーション

### 主要なAPIエンドポイント

| エンドポイント | メソッド | 説明 |
|--------------|--------|------|
| `/api/settings/storage/data-dir` | PUT | データディレクトリを設定 |
| `/api/settings/storage/current-file` | PUT | 現在のタスクファイルを設定 |
| `/api/settings/storage/recent-files` | GET | 最近使用したファイル一覧を取得 |
| `/api/storage/files` | GET | タスクファイル一覧を取得 |
| `/api/storage/files` | POST | 新しいタスクファイルを作成 |
| `/api/storage/directories` | GET | 利用可能なディレクトリ一覧を取得 |

### 実装の詳細

#### 設定の保存場所

設定は `~/.todolog/settings.json` に保存されます。これにより、アプリケーションの再起動後も設定が保持されます。

```typescript
// 設定ファイルの場所を決定
const userHomeDir = os.homedir();
const settingsDir = process.env.SETTINGS_DIR || path.join(userHomeDir, '.todolog');
const settingsFile = path.join(settingsDir, 'settings.json');
```

#### データディレクトリの動的変更

`FileService` クラスは、データディレクトリを動的に変更できるようになっています：

```typescript
class FileService {
  private dataDir: string;
  
  constructor(dataDir?: string, private settingsService?: SettingsService) {
    this.dataDir = dataDir || env.DATA_DIR;
  }
  
  // データディレクトリを取得
  getDataDir(): string {
    return this.dataDir;
  }
  
  // データディレクトリを設定
  setDataDir(newDir: string): void {
    this.dataDir = newDir;
  }
  
  // ファイルパスを解決
  resolvePath(filename: string): string {
    return path.join(this.dataDir, filename);
  }
}
```

#### ファイル名のバリデーション

セキュリティ上の理由から、ファイル名は厳格にバリデーションされます：

```typescript
private isValidFilename(filename: string): boolean {
  // ファイル名に使用できない文字や、ディレクトリトラバーサルを防止
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  const hasInvalidChars = invalidChars.test(filename);
  
  // パス区切り文字を含まないこと
  const containsPathSeparator = filename.includes(path.sep);
  
  // 相対パスを含まないこと
  const containsRelativePath = filename.includes('..') || filename === '.' || filename === '..';
  
  return !hasInvalidChars && !containsPathSeparator && !containsRelativePath;
}
```

### セキュリティ上の考慮事項

1. **ディレクトリトラバーサル攻撃の防止**
   - ファイル名やディレクトリパスのバリデーション
   - `path.join()` を使用した安全なパス解決

2. **権限エラーの適切な処理**
   - ディレクトリの書き込み権限チェック
   - エラーメッセージの適切な表示

3. **ユーザー入力の検証**
   - すべてのユーザー入力（ファイル名、ディレクトリパス）の厳格なバリデーション

### テスト戦略

1. **単体テスト**
   - `FileService` のメソッドのテスト
   - `SettingsService` のメソッドのテスト
   - バリデーション関数のテスト

2. **統合テスト**
   - APIエンドポイントのテスト
   - 設定の保存と読み込みのテスト
   - ファイル操作のテスト

3. **エッジケースのテスト**
   - 権限エラーのテスト
   - 無効なファイル名のテスト
   - 存在しないディレクトリのテスト
