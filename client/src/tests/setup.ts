import { afterAll, afterEach, beforeAll, vi, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { toHaveNoViolations } from 'jest-axe';
import { server } from './mocks/server';

// jest-axeのカスタムマッチャーを追加
expect.extend(toHaveNoViolations);

// MSWサーバーのセットアップ
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// 各テスト後にリクエストハンドラーをリセット
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// すべてのテスト後にサーバーを閉じる
afterAll(() => server.close());

// window.matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// window.scrollToのモック
window.scrollTo = vi.fn();

// window.ResizeObserverのモック
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// window.IntersectionObserverのモック
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// エラーログの抑制（テスト中のコンソールエラーを抑制）
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: An update to .* inside a test was not wrapped in act/.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};
