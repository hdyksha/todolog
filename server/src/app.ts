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
