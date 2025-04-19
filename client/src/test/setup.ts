import '@testing-library/jest-dom';
import { server } from './mocks/server';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// MSWのモックサーバーをセットアップ
beforeAll(() => {
  // window.matchMediaのモック
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // 非推奨だが互換性のために
      removeListener: vi.fn(), // 非推奨だが互換性のために
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // localStorage のモック
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  server.listen({ onUnhandledRequest: 'error' });
});

// 各テスト後にハンドラーをリセット
afterEach(() => server.resetHandlers());

// すべてのテスト終了後にサーバーをクローズ
afterAll(() => server.close());
