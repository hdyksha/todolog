import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import Notification from './Notification';

describe('Notification コンポーネント', () => {
  const mockOnClose = vi.fn();
  const testMessage = 'テスト通知';
  
  beforeEach(() => {
    mockOnClose.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('メッセージと種類が正しく表示される', () => {
    render(
      <Notification 
        message={testMessage} 
        type="success" 
        onClose={mockOnClose} 
      />
    );
    
    expect(screen.getByText(testMessage)).toBeInTheDocument();
    const notification = screen.getByText(testMessage).closest('.notification');
    expect(notification).toHaveClass('notification-success');
  });

  it('異なる種類の通知が正しく表示される', () => {
    const types: Array<'success' | 'error' | 'info' | 'warning'> = ['success', 'error', 'info', 'warning'];
    
    types.forEach(type => {
      const { unmount } = render(
        <Notification 
          message={`${type}通知`} 
          type={type} 
          onClose={mockOnClose} 
        />
      );
      
      const notification = screen.getByText(`${type}通知`).closest('.notification');
      expect(notification).toHaveClass(`notification-${type}`);
      
      unmount();
    });
  });

  it('閉じるボタンをクリックすると onClose が呼ばれる', () => {
    render(
      <Notification 
        message={testMessage} 
        type="info" 
        onClose={mockOnClose} 
      />
    );
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('指定した時間後に自動的に onClose が呼ばれる', () => {
    const duration = 2000;
    
    render(
      <Notification 
        message={testMessage} 
        type="warning" 
        onClose={mockOnClose}
        duration={duration}
      />
    );
    
    // タイマーが設定されていることを確認
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // 指定時間経過
    vi.advanceTimersByTime(duration);
    
    // onCloseが呼ばれたことを確認
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('デフォルトの時間（3000ms）後に自動的に onClose が呼ばれる', () => {
    render(
      <Notification 
        message={testMessage} 
        type="error" 
        onClose={mockOnClose}
      />
    );
    
    // タイマーが設定されていることを確認
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // 2999ms経過しても呼ばれない
    vi.advanceTimersByTime(2999);
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // 3000ms経過で呼ばれる
    vi.advanceTimersByTime(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('コンポーネントがアンマウントされるとタイマーがクリアされる', () => {
    const { unmount } = render(
      <Notification 
        message={testMessage} 
        type="info" 
        onClose={mockOnClose} 
      />
    );
    
    // アンマウント
    unmount();
    
    // 時間経過してもonCloseは呼ばれない
    vi.advanceTimersByTime(3000);
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
