import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { axe } from '../../tests/axe-helper';
import Modal from './Modal';

describe('Modal コンポーネントのアクセシビリティ', () => {
  const mockOnClose = vi.fn();

  it('基本的なモーダルでアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="テストモーダル"
      >
        <p>これはテストコンテンツです</p>
      </Modal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('フッター付きモーダルでもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="テストモーダル"
        footer={
          <div>
            <button>キャンセル</button>
            <button>確認</button>
          </div>
        }
      >
        <p>これはテストコンテンツです</p>
      </Modal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('閉じられた状態でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Modal
        isOpen={false}
        onClose={mockOnClose}
        title="テストモーダル"
      >
        <p>これはテストコンテンツです</p>
      </Modal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
