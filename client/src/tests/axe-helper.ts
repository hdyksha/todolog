import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

// カスタムマッチャーを追加
expect.extend(toHaveNoViolations);

// axe-coreの設定をカスタマイズ
export const axe = configureAxe({
  rules: {
    // 必要に応じてルールをカスタマイズ
    // 例: 'color-contrast': { enabled: false }
  },
});

// アクセシビリティテスト用のヘルパー関数
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};
