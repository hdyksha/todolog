import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorDisplay from './ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders with default props', () => {
    render(<ErrorDisplay message="エラーが発生しました" />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('エラーが発生しました', { selector: 'p.error-message' })).toBeInTheDocument();
    expect(screen.getByText('エラーが発生しました', { selector: 'h2.error-title' })).toBeInTheDocument();
    
    // 再試行ボタンはデフォルトでは表示されない
    expect(screen.queryByText('再試行')).not.toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorDisplay title="接続エラー" message="サーバーに接続できませんでした" />);
    
    expect(screen.getByText('接続エラー')).toBeInTheDocument();
    expect(screen.getByText('サーバーに接続できませんでした')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const mockRetry = vi.fn();
    render(
      <ErrorDisplay 
        message="エラーが発生しました" 
        onRetry={mockRetry} 
      />
    );
    
    const retryButton = screen.getByText('再試行');
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const mockRetry = vi.fn();
    render(
      <ErrorDisplay 
        message="エラーが発生しました" 
        onRetry={mockRetry} 
      />
    );
    
    const retryButton = screen.getByText('再試行');
    fireEvent.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('renders with custom retry label', () => {
    const mockRetry = vi.fn();
    render(
      <ErrorDisplay 
        message="エラーが発生しました" 
        onRetry={mockRetry} 
        retryLabel="もう一度読み込む" 
      />
    );
    
    expect(screen.getByText('もう一度読み込む')).toBeInTheDocument();
  });

  it('renders multiline error message correctly', () => {
    const multilineMessage = '1行目\n2行目\n3行目';
    render(<ErrorDisplay message={multilineMessage} />);
    
    // テキストコンテンツを直接比較するのではなく、要素が存在することを確認
    const messageElement = screen.getByText((content) => {
      return content.includes('1行目') && content.includes('2行目') && content.includes('3行目');
    });
    expect(messageElement).toBeInTheDocument();
  });
});
