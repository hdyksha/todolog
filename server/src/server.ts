import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// アプリケーションの作成
const app = createApp();
const PORT = env.PORT;

// サーバーの起動
app.listen(PORT, () => {
  logger.info(`サーバーが起動しました: http://localhost:${PORT}`);
  logger.info(`ヘルスチェック: http://localhost:${PORT}/health`);
  logger.info(`API エンドポイント: http://localhost:${PORT}/api/tasks`);
});
