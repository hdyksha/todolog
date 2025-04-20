import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import Modal from './Modal';
import { testKeyboardNavigation, testEscapeKeyClose } from '../../tests/keyboard-navigation-helper';

describe('Modal コンポーネントのキーボードナビゲーション', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('Tabキーでモーダル内の要素間を移動できること', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="テストモーダル"
        footer={
          <>
            <button>キャンセル</button>
            <button>確認</button>
          </>
        }
      >
        <input type="text" placeholder="テスト入力" />
        <textarea placeholder="テストエリア"></textarea>
      </Modal>
    );

    const modalElement = screen.getByRole('dialog');
    testKeyboardNavigation(modalElement);
  });

  it('Escキーでモーダルを閉じられること', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="テストモーダル"
      >
        <p>テストコンテンツ</p>
      </Modal>
    );

    const modalElement = screen.getByRole('dialog');
    testEscapeKeyClose(modalElement, mockOnClose);
  });
});
