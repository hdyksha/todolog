# TodoLog セットアップガイド

このガイドでは、TodoLogアプリケーションの開発環境のセットアップ方法と、本番環境へのデプロイ方法について説明します。

## 目次

1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [テスト環境のセットアップ](#テスト環境のセットアップ)
3. [本番環境へのデプロイ](#本番環境へのデプロイ)
4. [環境変数の設定](#環境変数の設定)
5. [トラブルシューティング](#トラブルシューティング)

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上
- Git

### 手順

#### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/todolog.git
cd todolog
```

#### 2. 依存関係のインストール

```bash
# ルートディレクトリで実行
npm run install:all

# または個別にインストール
cd client && npm install
cd ../server && npm install
```

#### 3. 環境変数の設定

```bash
# サーバーディレクトリで.envファイルを作成
cd server
cp .env.example .env
```

`.env`ファイルを編集して、必要な環境変数を設定します。

#### 4. 開発サーバーの起動

```bash
# ルートディレクトリで実行（フロントエンドとバックエンドの両方を起動）
npm run dev

# または個別に起動
# フロントエンドのみ
npm run client:dev

# バックエンドのみ
npm run server:dev
```

#### 5. アプリケーションへのアクセス

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3001

## テスト環境のセットアップ

### 単体テストと統合テストの実行

```bash
# サーバーディレクトリで実行
cd server

# すべてのテストを実行
npm test

# 単体テストのみ実行
npm run test:unit

# 統合テストのみ実行
npm run test:integration

# テストカバレッジレポートの生成
npm run test:coverage
```

### テスト用データベースの設定

テスト実行時は、自動的に一時的なデータディレクトリが使用されます。特別な設定は不要です。

## 本番環境へのデプロイ

### ビルド

```bash
# ルートディレクトリで実行
npm run build

# ビルド結果の確認
npm run preview
```

### デプロイ方法

#### 1. 従来のサーバーへのデプロイ

```bash
# ビルド
npm run build

# ビルド成果物をサーバーに転送
scp -r dist/* user@your-server:/path/to/deployment

# サーバー側での設定
ssh user@your-server
cd /path/to/deployment
npm install --production
```

#### 2. Docker を使用したデプロイ

```bash
# Dockerイメージのビルド
docker build -t todolog .

# コンテナの実行
docker run -p 3001:3001 -v /path/to/data:/app/server/data -e NODE_ENV=production todolog
```

#### 3. PM2 を使用した実行

```bash
# PM2のインストール（グローバル）
npm install -g pm2

# アプリケーションの起動
pm2 start dist/server/src/index.js --name todolog

# 起動時に自動実行するように設定
pm2 startup
pm2 save
```

### Nginx リバースプロキシの設定

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 環境変数の設定

TodoLogは以下の環境変数を使用します：

| 変数名 | 説明 | デフォルト値 | 必須 |
|-------|------|------------|------|
| PORT | サーバーのポート番号 | 3001 | いいえ |
| DATA_DIR | データファイルの保存ディレクトリ | ./data | いいえ |
| NODE_ENV | 実行環境（development, test, production） | development | いいえ |
| LOG_LEVEL | ログレベル（debug, info, warn, error） | info | いいえ |

### 環境変数の設定方法

#### 開発環境

`.env`ファイルを使用します：

```
PORT=3001
DATA_DIR=./data
NODE_ENV=development
LOG_LEVEL=debug
```

#### 本番環境

システムの環境変数として設定するか、`.env`ファイルを使用します：

```bash
# システム環境変数として設定
export PORT=3001
export DATA_DIR=/var/data/todolog
export NODE_ENV=production
export LOG_LEVEL=info

# または起動時に指定
PORT=3001 DATA_DIR=/var/data/todolog NODE_ENV=production node dist/server/src/index.js
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. サーバーが起動しない

**症状**: `npm run server:dev`を実行してもサーバーが起動しない

**解決策**:
- ポートが既に使用されていないか確認: `lsof -i :3001`
- 依存関係が正しくインストールされているか確認: `npm install`
- ログを確認: `npm run server:dev`の出力を確認

#### 2. データが保存されない

**症状**: タスクを作成/編集しても、再読み込み後にデータが消えている

**解決策**:
- DATA_DIRが正しく設定されているか確認
- ディレクトリの書き込み権限を確認: `ls -la $DATA_DIR`
- ログを確認: エラーメッセージがないか確認

#### 3. テストが失敗する

**症状**: `npm test`を実行するとテストが失敗する

**解決策**:
- NODE_ENV=testが設定されているか確認
- 最新の依存関係がインストールされているか確認: `npm install`
- テスト用のデータディレクトリが存在し、書き込み可能か確認

#### 4. ビルドエラー

**症状**: `npm run build`でエラーが発生する

**解決策**:
- TypeScriptエラーを修正: エラーメッセージを確認
- 依存関係を更新: `npm install`
- node_modulesを削除して再インストール: `rm -rf node_modules && npm install`

### ログの確認方法

```bash
# 開発環境でのログ
npm run server:dev

# 本番環境でのログ（PM2使用時）
pm2 logs todolog

# ファイルに出力されたログ
cat logs/app.log
```

### サポートの取得

問題が解決しない場合は、以下の情報を含めてIssueを作成してください：

1. 発生している問題の詳細な説明
2. 実行環境（OS、Node.jsバージョン、npmバージョン）
3. 実行したコマンドとその出力
4. エラーメッセージやスタックトレース
5. 関連するログの抜粋
