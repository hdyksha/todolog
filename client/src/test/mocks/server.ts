import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// テスト用のモックサーバーをセットアップ
export const server = setupServer(...handlers);
