import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTaskRoutes } from './routes/taskRoutes.js';
import { createSettingsRoutes } from './routes/settingsRoutes.js';
import { createStorageRoutes } from './routes/storageRoutes.js';
import { createDirectoryRoutes } from './routes/directoryRoutes.js';
import { createTagRoutes } from './routes/tagRoutes.js';
import { requestLogger } from './utils/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { setupSecurity } from './middleware/security.js';
import { setupRateLimiter } from './middleware/rate-limiter.js';
import { etagMiddleware, cacheControl } from './middleware/cache.js';
import { env } from './config/env.js';
import { config } from 'dotenv';
import { initializeServices } from './services/serviceContainer.js';

// .env ファイルから環境変数を読み込む
config();

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * アプリケーションを作成する
 * @param options アプリケーション設定オプション
 * @returns Express アプリケーション
 */
export function createApp(options: {
  settingsDir?: string;
  settingsFile?: string;
} = {}) {
  const app = express();

  // サービスの初期化
  initializeServices({
    settingsDir: options.settingsDir,
    settingsFile: options.settingsFile
  });

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
  app.use('/api/tasks', createTaskRoutes());
  app.use('/api/settings', createSettingsRoutes());
  app.use('/api/storage', createStorageRoutes());
  app.use('/api/storage', createDirectoryRoutes());
  app.use('/api/tags', createTagRoutes());

  // エラーハンドリングミドルウェア
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
