// APIのベースURL
// 開発環境ではViteのプロキシを使用するため、相対パスを使用
export const API_BASE_URL = '/api';

// APIリクエストのタイムアウト（ミリ秒）
export const API_TIMEOUT = 10000;

// キャッシュ設定
export const CACHE_CONFIG = {
  // キャッシュの有効期間（ミリ秒）
  staleTime: 5 * 60 * 1000, // 5分
  // 再試行回数
  retry: 1,
  // 再試行の間隔（ミリ秒）
  retryDelay: 1000,
};
