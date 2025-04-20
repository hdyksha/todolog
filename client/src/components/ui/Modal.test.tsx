import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import Modal from './Modal';

describe('Modal コンポーネント', () => {
  const mockOnClose = vi.fn();
  const modalTitle = 'テストモーダル';
  const modalContent = 'モーダルの内容';
  
  beforeEach(() => {
    mockOnClose.mockClear();
    vi.clearAllMocks();
  });

  it('isOpen=true の場合、モーダルが表示される', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        {modalContent}
      </Modal>
    );
    
    expect(screen.getByText(modalTitle)).toBeInTheDocument();
    expect(screen.getByText(modalContent)).toBeInTheDocument();
  });

  it('isOpen=false の場合、モーダルが表示されない', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title={modalTitle}>
        {modalContent}
      </Modal>
    );
    
    expect(screen.queryByText(modalTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(modalContent)).not.toBeInTheDocument();
  });

  it('閉じるボタンをクリックすると onClose が呼ばれる', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        {modalContent}
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('閉じる');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('オーバーレイをクリックすると onClose が呼ばれる', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        {modalContent}
      </Modal>
    );
    
    // モーダルの外側（オーバーレイ）をクリック
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('モーダル内部をクリックしても onClose は呼ばれない', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        {modalContent}
      </Modal>
    );
    
    // モーダルの内部をクリック
    fireEvent.click(screen.getByText(modalContent));
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('Escキーを押すと onClose が呼ばれる', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle}>
        {modalContent}
      </Modal>
    );
    
    // Escキーイベントを発火
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('異なるサイズのモーダルが正しく表示される', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle} size="small">
        {modalContent}
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('modal-small');
    
    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title={modalTitle} size="large">
        {modalContent}
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('modal-large');
  });

  it('フッターが正しく表示される', () => {
    const footerContent = 'フッターの内容';
    
    render(
      <Modal 
        isOpen={true} 
        onClose={mockOnClose} 
        title={modalTitle}
        footer={<div>{footerContent}</div>}
      >
        {modalContent}
      </Modal>
    );
    
    expect(screen.getByText(footerContent)).toBeInTheDocument();
  });
});
