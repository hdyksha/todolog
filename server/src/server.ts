import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// サーバーの起動
const app = createApp({
  settingsDir: process.env.SETTINGS_DIR,
  settingsFile: process.env.SETTINGS_FILE
});

const PORT = env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`サーバーが起動しました: http://localhost:${PORT}`);
});
