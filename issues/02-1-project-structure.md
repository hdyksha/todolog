# フェーズ1: プロジェクト構造とベース実装

## 目標

基本的なプロジェクト構造を整備し、Expressサーバーの基本機能を実装します。

## タスク

### 1.1 プロジェクト構造の整備 ✅

- ディレクトリ構造の設計
- 必要なパッケージのインストール
- TypeScriptの設定

### 1.2 ESモジュール対応 ✅

- package.jsonに `"type": "module"` を追加
- import/export文の修正
- パス解決の対応

### 1.3 テストフレームワーク（Vitest）の設定 ✅

- Vitestのインストールと設定
- サンプルテストの作成

### 1.4 基本的なExpressサーバーの実装 ✅

- Expressアプリケーションの作成
- ルーティングの基本設定
- ミドルウェアの設定（CORS, JSON解析など）
- ヘルスチェックエンドポイントの実装

### 1.5 環境変数の設定 ✅

- dotenvの設定
- 環境変数の型定義
- 環境変数のバリデーション

### 1.6 ロギング機能の実装 ✅

- Winstonロガーの設定
- ログレベルの設定
- ログフォーマットの設定
- リクエストロギングミドルウェアの実装

### 1.7 エラーハンドリングミドルウェアの実装 ✅

- グローバルエラーハンドラーの実装
- 404ハンドラーの実装
- エラーレスポンスの標準化

## 実装詳細

### 1.4 基本的なExpressサーバーの実装

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { taskRoutes } from './routes/taskRoutes.js';
import { requestLogger } from './utils/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // ミドルウェアの設定
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // ヘルスチェックエンドポイント
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
  });

  // APIルートの設定
  app.use('/api', taskRoutes);

  // エラーハンドリングミドルウェア
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
```

### 1.5 環境変数の設定

```typescript
// src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .envファイルの読み込み
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 環境変数のスキーマ定義
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3001'),
  DATA_DIR: z.string().default('./data'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

// 環境変数の検証と型付け
export const env = envSchema.parse(process.env);
```

### 1.6 ロギング機能の実装

```typescript
// src/utils/logger.ts
import winston from 'winston';
import { env } from '../config/env.js';
import { Request, Response, NextFunction } from 'express';

// ロガーの設定
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // 本番環境ではファイルにも出力
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'error.log', level: 'error' }),
          new winston.transports.File({ filename: 'combined.log' }),
        ]
      : []),
  ],
});

// リクエストロギングミドルウェア
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
};
```

### 1.7 エラーハンドリングミドルウェアの実装

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// 404エラーハンドラー
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `リソースが見つかりません: ${req.originalUrl}`,
  });
};

// グローバルエラーハンドラー
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? '内部サーバーエラーが発生しました' 
      : err.message,
  });
};
```

## テスト

### ヘルスチェックエンドポイントのテスト

```typescript
// tests/integration/health.test.ts
import { describe, it, expect } from 'vitest';
import { createApp } from '../../src/app.js';
import request from 'supertest';

describe('ヘルスチェックエンドポイント', () => {
  const app = createApp();

  it('GET /health が200を返すべき', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
```

## 実装結果

フェーズ1の実装が完了しました。以下の機能が実装されています：

1. **基本的なExpressサーバーの実装**
   - ヘルスチェックエンドポイント（`/health`）
   - CORSとJSONパーサーミドルウェア
   - リクエストロギング

2. **環境変数の設定**
   - Zodを使用した環境変数のバリデーションと型付け
   - `.env`と`.env.example`ファイルの作成
   - 環境変数：PORT, DATA_DIR, NODE_ENV, LOG_LEVEL

3. **ロギング機能の実装**
   - Winstonロガーの設定
   - コンソールとファイルへのログ出力
   - リクエストロギングミドルウェア

4. **エラーハンドリングミドルウェアの実装**
   - 404エラーハンドラー
   - グローバルエラーハンドラー
   - 環境に応じたエラーメッセージの調整

すべてのテストが正常に実行され、フェーズ1の実装が完了しました。

## 次のステップ

フェーズ2（データ永続化レイヤーの実装）に進みます。
