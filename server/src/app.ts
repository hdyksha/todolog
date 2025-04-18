import express from 'express';
import cors from 'cors';
import path from 'path';
import { taskRoutes } from './routes/taskRoutes';

export function createApp() {
  const app = express();

  // ミドルウェアの設定
  app.use(cors());
  app.use(express.json());

  // APIルートの設定
  app.use('/api', taskRoutes);

  // 本番環境では静的ファイルを提供
  if (process.env.NODE_ENV === 'production') {
    // クライアントのビルドディレクトリを静的ファイルとして提供
    app.use(express.static(path.join(__dirname, '../../client/dist')));

    // その他のリクエストはすべてindex.htmlにリダイレクト
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
  }

  return app;
}
