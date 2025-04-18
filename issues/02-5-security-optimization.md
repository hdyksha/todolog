# フェーズ5: セキュリティと最適化

## 目標

アプリケーションのセキュリティを強化し、パフォーマンスを最適化します。

## タスク

### 5.1 入力バリデーションの強化 ✅

- Zodスキーマの詳細化
- カスタムバリデーションの追加
- エラーメッセージの改善

### 5.2 セキュリティヘッダーの設定 ✅

- Helmetの導入
- CSP（Content Security Policy）の設定
- その他のセキュリティヘッダーの設定

### 5.3 レート制限の実装 ✅

- express-rate-limitの導入
- APIエンドポイントの保護
- レート制限の設定

### 5.4 キャッシュ戦略の実装 ✅

- ETagの設定
- 条件付きリクエストの処理
- キャッシュヘッダーの設定

### 5.5 エラーレスポンスの標準化 ✅

- エラーレスポンスの形式統一
- エラーコードの定義
- 開発環境と本番環境でのエラー情報の調整

## 実装詳細

### 5.1 入力バリデーションの強化

```typescript
// src/models/task.model.ts を強化
import { z } from 'zod';

// 優先度の定義
export const PriorityEnum = z.enum(['high', 'medium', 'low']);
export type Priority = z.infer<typeof PriorityEnum>;

// 日付バリデーション用のヘルパー関数
const isValidDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// タスク作成時のスキーマ
export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内にしてください')
    .trim(),
  completed: z.boolean().default(false),
  priority: PriorityEnum.default('medium'),
  category: z
    .string()
    .max(50, 'カテゴリは50文字以内にしてください')
    .trim()
    .optional(),
  dueDate: z
    .string()
    .refine(val => !val || isValidDate(val), {
      message: '有効な日付形式ではありません',
    })
    .optional(),
  memo: z
    .string()
    .max(1000, 'メモは1000文字以内にしてください')
    .trim()
    .optional(),
});

// タスク更新時のスキーマ
export const UpdateTaskSchema = CreateTaskSchema.partial();

// メモ更新用のスキーマ
export const MemoUpdateSchema = z.object({
  memo: z
    .string()
    .max(1000, 'メモは1000文字以内にしてください')
    .trim()
    .optional(),
});

// タスクの完全なスキーマ（IDと日時情報を含む）
export const TaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid('無効なID形式です'),
  createdAt: z
    .string()
    .refine(isValidDate, { message: '無効な作成日時です' }),
  updatedAt: z
    .string()
    .refine(isValidDate, { message: '無効な更新日時です' }),
});

// フィルタリング用のスキーマ
export const TaskFilterSchema = z.object({
  status: z.enum(['all', 'completed', 'active']).optional(),
  priority: PriorityEnum.optional(),
  category: z.string().trim().optional(),
  searchTerm: z.string().trim().optional(),
  dueDate: z
    .string()
    .refine(val => !val || isValidDate(val), {
      message: '有効な日付形式ではありません',
    })
    .optional(),
  page: z
    .string()
    .refine(val => !val || !isNaN(Number(val)), {
      message: 'ページ番号は数値である必要があります',
    })
    .optional(),
  limit: z
    .string()
    .refine(val => !val || !isNaN(Number(val)), {
      message: '表示件数は数値である必要があります',
    })
    .optional(),
  sortField: z
    .enum(['title', 'priority', 'dueDate', 'createdAt', 'updatedAt'])
    .optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

// 型定義のエクスポート
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type MemoUpdateInput = z.infer<typeof MemoUpdateSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TaskFilter = z.infer<typeof TaskFilterSchema>;
```

### 5.2 セキュリティヘッダーの設定

```typescript
// src/middleware/security.ts
import helmet from 'helmet';
import { Express } from 'express';
import { env } from '../config/env.js';

/**
 * セキュリティ関連のミドルウェアを設定する
 * @param app Expressアプリケーション
 */
export function setupSecurity(app: Express): void {
  // Helmetの基本設定
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // 開発環境用に緩和
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // X-XSS-Protection
      xssFilter: true,
      // X-Content-Type-Options
      noSniff: true,
      // X-Frame-Options
      frameguard: {
        action: 'deny',
      },
      // Strict-Transport-Security
      hsts: {
        maxAge: 31536000, // 1年
        includeSubDomains: true,
        preload: true,
      },
      // Referrer-Policy
      referrerPolicy: {
        policy: 'same-origin',
      },
    })
  );

  // 開発環境ではCSPを緩和
  if (env.NODE_ENV === 'development') {
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", 'ws:', 'wss:'], // WebSocketのサポート
        },
      })
    );
  }
}
```

### 5.3 レート制限の実装

```typescript
// src/middleware/rate-limiter.ts
import rateLimit from 'express-rate-limit';
import { Express } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * レート制限のミドルウェアを設定する
 * @param app Expressアプリケーション
 */
export function setupRateLimiter(app: Express): void {
  // テスト環境ではレート制限を無効化
  if (env.NODE_ENV === 'test') {
    return;
  }

  // API全体のレート制限
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100, // 15分あたり100リクエストまで
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`レート制限を超過しました: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'リクエスト数が制限を超えました。しばらく経ってから再試行してください。',
      });
    },
  });

  // 書き込み操作（POST, PUT, DELETE）に対するより厳しいレート制限
  const writeOperationsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1時間
    max: 50, // 1時間あたり50リクエストまで
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`書き込み操作のレート制限を超過しました: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: '書き込み操作のリクエスト数が制限を超えました。しばらく経ってから再試行してください。',
      });
    },
    // POST, PUT, DELETEメソッドのみに適用
    skip: (req) => !['POST', 'PUT', 'DELETE'].includes(req.method),
  });

  // APIルートにレート制限を適用
  app.use('/api/', apiLimiter);
  app.use('/api/', writeOperationsLimiter);
}
```

### 5.4 キャッシュ戦略の実装

```typescript
// src/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import crypto from 'crypto';

/**
 * ETagを生成するミドルウェア
 */
export function etagMiddleware(req: Request, res: Response, next: NextFunction) {
  // 元のjsonメソッドを保存
  const originalJson = res.json;

  // jsonメソッドをオーバーライド
  res.json = function(body) {
    // 元のjsonメソッドを呼び出す前にETagを設定
    if (body) {
      const etag = generateETag(body);
      res.setHeader('ETag', etag);
      
      // If-None-Matchヘッダーがあり、ETagと一致する場合は304を返す
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        res.status(304).end();
        return res;
      }
    }
    
    // 元のjsonメソッドを呼び出す
    return originalJson.call(this, body);
  };
  
  next();
}

/**
 * キャッシュヘッダーを設定するミドルウェア
 * @param maxAge キャッシュの最大有効期間（秒）
 */
export function cacheControl(maxAge: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 開発環境ではキャッシュを無効化
    if (env.NODE_ENV === 'development') {
      res.setHeader('Cache-Control', 'no-store');
    } else {
      // 本番環境では指定された時間だけキャッシュを有効化
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    }
    next();
  };
}

/**
 * オブジェクトからETagを生成する
 * @param obj ETagを生成するオブジェクト
 * @returns ETag文字列
 */
function generateETag(obj: any): string {
  const str = JSON.stringify(obj);
  return crypto.createHash('md5').update(str).digest('hex');
}
```

### 5.5 エラーレスポンスの標準化

```typescript
// src/utils/error.ts
import { z } from 'zod';

// エラーコード定義
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// APIエラーの基本クラス
export class ApiError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: any;

  constructor(message: string, statusCode: number, code: ErrorCode, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  // レスポンス用のオブジェクトを生成
  toResponse() {
    const response: any = {
      error: {
        code: this.code,
        message: this.message,
      },
    };

    if (this.details) {
      response.error.details = this.details;
    }

    return response;
  }
}

// 400 Bad Request
export class BadRequestError extends ApiError {
  constructor(message = 'リクエストが不正です', details?: any) {
    super(message, 400, ErrorCode.BAD_REQUEST, details);
  }
}

// 404 Not Found
export class NotFoundError extends ApiError {
  constructor(message = 'リソースが見つかりません', details?: any) {
    super(message, 404, ErrorCode.NOT_FOUND, details);
  }
}

// 500 Internal Server Error
export class InternalServerError extends ApiError {
  constructor(message = '内部サーバーエラーが発生しました', details?: any) {
    super(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, details);
  }
}

// バリデーションエラー
export class ValidationError extends ApiError {
  constructor(zodError: z.ZodError) {
    const details = zodError.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    
    super('入力値が不正です', 400, ErrorCode.VALIDATION_ERROR, details);
  }
}

// src/middleware/errorHandler.ts を更新
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ApiError, InternalServerError } from '../utils/error.js';
import { env } from '../config/env.js';
import { ZodError } from 'zod';
import { ValidationError } from '../utils/error.js';

// 404エラーハンドラー
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `リソースが見つかりません: ${req.originalUrl}`,
    },
  });
};

// グローバルエラーハンドラー
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // エラーをログに記録
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Zodのバリデーションエラーを処理
  if (err instanceof ZodError) {
    const validationError = new ValidationError(err);
    return res.status(validationError.statusCode).json(validationError.toResponse());
  }

  // APIエラーを処理
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toResponse());
  }

  // その他のエラーは500 Internal Server Errorとして処理
  const serverError = new InternalServerError(
    env.NODE_ENV === 'production' ? '内部サーバーエラーが発生しました' : err.message
  );
  
  res.status(serverError.statusCode).json(serverError.toResponse());
};
```

### アプリケーションへの統合

```typescript
// src/app.ts を更新
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { FileService } from './services/file.service.js';
import { TaskService } from './services/task.service.js';
import { TaskController } from './controllers/task.controller.js';
import { CategoryController } from './controllers/category.controller.js';
import { createTaskRouter } from './routes/task.routes.js';
import { createCategoryRouter } from './routes/category.routes.js';
import { requestLogger } from './utils/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { setupSecurity } from './middleware/security.js';
import { setupRateLimiter } from './middleware/rate-limiter.js';
import { etagMiddleware, cacheControl } from './middleware/cache.js';
import { env } from './config/env.js';

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  
  // セキュリティ設定
  setupSecurity(app);
  
  // 基本ミドルウェアの設定
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  
  // レート制限の設定
  setupRateLimiter(app);
  
  // キャッシュ関連のミドルウェア
  app.use(etagMiddleware);
  
  // ヘルスチェックエンドポイント
  app.get('/health', cacheControl(60), (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // サービスとコントローラーの初期化
  const fileService = new FileService();
  const taskService = new TaskService(fileService);
  const taskController = new TaskController(taskService);
  const categoryController = new CategoryController(taskService);
  
  // APIルートの設定
  app.use('/api/tasks', createTaskRouter(taskController));
  app.use('/api/categories', cacheControl(300), createCategoryRouter(categoryController));
  
  // 本番環境では静的ファイルを提供
  if (env.NODE_ENV === 'production') {
    // クライアントのビルドディレクトリを静的ファイルとして提供
    app.use(express.static(path.join(__dirname, '../../client/dist')));
    
    // その他のリクエストはすべてindex.htmlにリダイレクト
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
  }
  
  // エラーハンドリングミドルウェア
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
}
```

## テスト

### セキュリティ設定のテスト

```typescript
// tests/integration/security.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('セキュリティ設定テスト', () => {
  const app = createApp();
  
  it('セキュリティヘッダーが正しく設定されているべき', async () => {
    const response = await request(app).get('/health');
    
    // Content-Security-Policy
    expect(response.headers).toHaveProperty('content-security-policy');
    
    // X-XSS-Protection
    expect(response.headers).toHaveProperty('x-xss-protection');
    
    // X-Content-Type-Options
    expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
    
    // X-Frame-Options
    expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
    
    // Strict-Transport-Security
    expect(response.headers).toHaveProperty('strict-transport-security');
    
    // Referrer-Policy
    expect(response.headers).toHaveProperty('referrer-policy');
  });
});
```

### エラーハンドリングのテスト

```typescript
// tests/integration/error-handling.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('エラーハンドリングテスト', () => {
  const app = createApp();
  
  it('存在しないエンドポイントにアクセスすると404を返すべき', async () => {
    const response = await request(app).get('/api/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
  
  it('不正なリクエストボディを送信すると400を返すべき', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        // titleが必須だが省略
        priority: 'invalid-priority', // 無効な優先度
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(response.body.error).toHaveProperty('details');
  });
});
```

### キャッシュ機能のテスト

```typescript
// tests/integration/cache.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('キャッシュ機能テスト', () => {
  const app = createApp();
  
  it('ETagヘッダーが設定されるべき', async () => {
    const response = await request(app).get('/api/tasks');
    
    expect(response.headers).toHaveProperty('etag');
  });
  
  it('同じリクエストでIf-None-Matchヘッダーを送信すると304を返すべき', async () => {
    // 最初のリクエスト
    const response1 = await request(app).get('/api/tasks');
    const etag = response1.headers.etag;
    
    // 同じリクエストでETagを指定
    const response2 = await request(app)
      .get('/api/tasks')
      .set('If-None-Match', etag);
    
    expect(response2.status).toBe(304);
  });
  
  it('Cache-Controlヘッダーが設定されるべき', async () => {
    const response = await request(app).get('/api/categories');
    
    expect(response.headers).toHaveProperty('cache-control');
  });
});
```

## 次のステップ

フェーズ5が完了したら、フェーズ6（テストとドキュメント）に進みます。
