import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import Input from './Input';

describe('Input コンポーネント', () => {
  it('ラベルが正しく表示される', () => {
    render(<Input label="テストラベル" id="test" />);
    expect(screen.getByLabelText('テストラベル')).toBeInTheDocument();
  });

  it('入力値が正しく更新される', () => {
    const handleChange = vi.fn();
    render(<Input label="テスト" id="test" onChange={handleChange} />);
    
    const input = screen.getByLabelText('テスト');
    fireEvent.change(input, { target: { value: 'テスト入力' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('テスト入力');
  });

  it('エラーメッセージが表示される', () => {
    render(<Input label="テスト" id="test" error="エラーメッセージ" />);
    
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
    expect(screen.getByLabelText('テスト')).toHaveClass('input-error');
  });

  it('無効状態が適用される', () => {
    render(<Input label="テスト" id="test" disabled />);
    
    expect(screen.getByLabelText('テスト')).toBeDisabled();
  });

  it('プレースホルダーが表示される', () => {
    render(<Input label="テスト" id="test" placeholder="入力してください" />);
    
    expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
  });

  it('必須フィールドのマークが表示される', () => {
    render(<Input label="テスト" id="test" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('input-required');
  });
});
