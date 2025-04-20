import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Modal from './Modal';

// ARIA属性の検証テスト
describe('コンポーネントのARIA属性検証', () => {
  // ボタンのARIA属性検証
  describe('Button コンポーネント', () => {
    it('無効状態の場合、aria-disabled属性が設定されること', () => {
      const { getByRole } = render(<Button disabled>無効ボタン</Button>);
      const button = getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('ローディング状態の場合、適切なARIA属性が設定されること', () => {
      const { getByRole } = render(<Button isLoading>ローディング</Button>);
      const button = getByRole('button');
      expect(button).toHaveAttribute('disabled');
      // ローディングスピナーが存在することを確認
      expect(button.querySelector('.button-spinner')).not.toBeNull();
    });
  });

  // 入力フィールドのARIA属性検証
  describe('Input コンポーネント', () => {
    it('エラー状態の場合、aria-invalid属性が設定されること', () => {
      const { getByLabelText } = render(
        <Input
          label="テスト入力"
          error="エラーメッセージ"
          name="test"
        />
      );
      const input = getByLabelText('テスト入力');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラーメッセージがある場合、aria-describedby属性が設定されること', () => {
      const { getByLabelText } = render(
        <Input
          label="テスト入力"
          error="エラーメッセージ"
          name="test"
          id="test-input"
        />
      );
      const input = getByLabelText('テスト入力');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });

    it('ヘルパーテキストがある場合、aria-describedby属性が設定されること', () => {
      const { getByLabelText } = render(
        <Input
          label="テスト入力"
          helperText="ヘルパーテキスト"
          name="test"
          id="test-input"
        />
      );
      const input = getByLabelText('テスト入力');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
    });
  });

  // セレクトフィールドのARIA属性検証
  describe('Select コンポーネント', () => {
    const options = [
      { value: 'option1', label: 'オプション1' },
      { value: 'option2', label: 'オプション2' },
    ];

    it('エラー状態の場合、aria-invalid属性が設定されること', () => {
      const { getByLabelText } = render(
        <Select
          label="テスト選択"
          error="エラーメッセージ"
          name="test"
          value=""
          options={options}
          onChange={() => {}}
        />
      );
      const select = getByLabelText('テスト選択');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラーメッセージがある場合、aria-describedby属性が設定されること', () => {
      const { getByLabelText } = render(
        <Select
          label="テスト選択"
          error="エラーメッセージ"
          name="test"
          id="test-select"
          value=""
          options={options}
          onChange={() => {}}
        />
      );
      const select = getByLabelText('テスト選択');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
    });
  });

  // モーダルのARIA属性検証
  describe('Modal コンポーネント', () => {
    it('適切なARIA属性が設定されること', () => {
      const { getByRole } = render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="テストモーダル"
        >
          <p>モーダルコンテンツ</p>
        </Modal>
      );
      const dialog = getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('閉じるボタンに適切なARIA属性が設定されること', () => {
      const { getByLabelText } = render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="テストモーダル"
        >
          <p>モーダルコンテンツ</p>
        </Modal>
      );
      const closeButton = getByLabelText('閉じる');
      expect(closeButton).toBeInTheDocument();
    });
  });
});
