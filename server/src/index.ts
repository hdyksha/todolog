import { createApp } from './app';
import path from 'path';
import dotenv from 'dotenv';

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
