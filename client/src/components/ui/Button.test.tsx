import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import Button from './Button';

describe('Button コンポーネント', () => {
  it('ボタンのテキストが正しく表示される', () => {
    render(<Button>テストボタン</Button>);
    expect(screen.getByText('テストボタン')).toBeInTheDocument();
  });

  it('クリックイベントが発火する', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    
    fireEvent.click(screen.getByText('クリック'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('無効状態では操作できない', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>クリック</Button>);
    
    const button = screen.getByText('クリック');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('ローディング状態が正しく表示される', () => {
    render(<Button isLoading>ローディング</Button>);
    
    // ボタンが無効化されていることを確認
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // ローディングインジケーターが表示されていることを確認
    expect(button.querySelector('.button-spinner')).toBeInTheDocument();
  });

  it('異なるバリエーションが適用される', () => {
    const { rerender } = render(<Button variant="primary">プライマリ</Button>);
    expect(screen.getByText('プライマリ').closest('button')).toHaveClass('button-primary');
    
    rerender(<Button variant="secondary">セカンダリ</Button>);
    expect(screen.getByText('セカンダリ').closest('button')).toHaveClass('button-secondary');
    
    rerender(<Button variant="text">テキスト</Button>);
    expect(screen.getByText('テキスト').closest('button')).toHaveClass('button-text');
  });
});
