import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { axe } from '../../tests/axe-helper';
import Button from './Button';

// コントラスト比のチェック
// 注: axe-coreには色のコントラスト比をチェックする機能が含まれています
describe('コンポーネントのコントラスト比検証', () => {
  describe('Button コンポーネント', () => {
    it('プライマリーボタンのコントラスト比がWCAG AAレベルを満たすこと', async () => {
      const { container } = render(<Button variant="primary">プライマリーボタン</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('セカンダリーボタンのコントラスト比がWCAG AAレベルを満たすこと', async () => {
      const { container } = render(<Button variant="secondary">セカンダリーボタン</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('デンジャーボタンのコントラスト比がWCAG AAレベルを満たすこと', async () => {
      const { container } = render(<Button variant="danger">デンジャーボタン</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('テキストボタンのコントラスト比がWCAG AAレベルを満たすこと', async () => {
      const { container } = render(<Button variant="text">テキストボタン</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
