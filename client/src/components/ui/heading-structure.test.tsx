import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import Modal from './Modal';

// 見出し構造の検証テスト
describe('コンポーネントの見出し構造検証', () => {
  describe('Modal コンポーネント', () => {
    it('モーダルタイトルが適切な見出し要素として実装されていること', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="テストモーダル"
        >
          <p>モーダルコンテンツ</p>
        </Modal>
      );
      
      // モーダルタイトルがh2要素として実装されていることを確認
      const heading = screen.getByRole('heading', { level: 2, name: 'テストモーダル' });
      expect(heading).toBeInTheDocument();
      
      // タイトルにIDが設定されていることを確認（aria-labelledbyで参照するため）
      expect(heading).toHaveAttribute('id', 'modal-title');
    });
  });
});
