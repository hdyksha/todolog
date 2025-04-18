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
