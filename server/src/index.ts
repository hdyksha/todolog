import { createApp } from './app.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .envファイルの読み込み
dotenv.config();

// ポート番号の設定
const PORT = process.env.PORT || 3001;

// アプリケーションの作成
const app = createApp();

// サーバーの起動
app.listen(PORT, () => {
  console.log(`TodoLog API サーバーが起動しました: http://localhost:${PORT}`);
});
