import { createApp } from './app.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ポート番号の設定
const PORT = env.PORT;

// アプリケーションの作成
const app = createApp();

// サーバーの起動
app.listen(PORT, () => {
  logger.info(`TodoLog API サーバーが起動しました: http://localhost:${PORT}`);
});
