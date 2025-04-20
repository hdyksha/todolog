import { fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * キーボードナビゲーションをシミュレートするヘルパー関数
 * @param container テスト対象のコンテナ要素
 * @param selector フォーカス可能な要素のセレクタ
 */
export const testKeyboardNavigation = (container: HTMLElement, selector: string = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])') => {
  // フォーカス可能な要素を取得
  const focusableElements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  
  // フォーカス可能な要素がない場合はスキップ
  if (focusableElements.length === 0) {
    return;
  }
  
  // 各要素がフォーカス可能であることを確認
  focusableElements.forEach(element => {
    element.focus();
    expect(document.activeElement).not.toBe(document.body);
  });
};

/**
 * Escキーでの閉じる動作をテストするヘルパー関数
 * @param element テスト対象の要素
 * @param callback Escキーが押されたときに呼ばれるコールバック関数
 */
export const testEscapeKeyClose = (element: HTMLElement, callback: () => void) => {
  fireEvent.keyDown(element, { key: 'Escape', code: 'Escape' });
  expect(callback).toHaveBeenCalled();
};
