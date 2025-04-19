import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// ブラウザ用のモックワーカーをセットアップ
export const worker = setupWorker(...handlers);
