import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

// モーダルのポータルをテストするためのセットアップ
const modalRoot = document.createElement('div');
modalRoot.setAttribute('id', 'modal-root');
document.body.appendChild(modalRoot);

describe('ConfirmDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders correctly when open', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="確認"
        message="本当に削除しますか？"
      />
    );
    
    expect(screen.getByText('確認', { selector: 'h2.modal-title' })).toBeInTheDocument();
    expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });
  
  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="確認"
        message="本当に削除しますか？"
      />
    );
    
    expect(screen.queryByText('確認')).not.toBeInTheDocument();
    expect(screen.queryByText('本当に削除しますか？')).not.toBeInTheDocument();
  });
  
  it('calls onClose when cancel button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="確認"
        message="本当に削除しますか？"
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
  
  it('calls onConfirm and onClose when confirm button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="確認"
        message="本当に削除しますか？"
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: '確認' }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('renders with custom button labels', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="確認"
        message="本当に削除しますか？"
        confirmLabel="はい"
        cancelLabel="いいえ"
      />
    );
    
    expect(screen.getByRole('button', { name: 'はい' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'いいえ' })).toBeInTheDocument();
  });
  
  it('renders with danger variant', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="確認"
        message="本当に削除しますか？"
        variant="danger"
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: '確認' });
    expect(confirmButton.className).toContain('button-error');
  });
  
  it('renders with warning variant', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="確認"
        message="本当に削除しますか？"
        variant="warning"
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: '確認' });
    expect(confirmButton.className).toContain('button-warning');
  });
});
