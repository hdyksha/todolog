import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { taskRoutes } from './routes/taskRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
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
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
  });

  // APIルートの設定
  app.use('/api/tasks', taskRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/storage', storageRoutes);

  // エラーハンドリングミドルウェア
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
