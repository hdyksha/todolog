/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EditableDueDate from './EditableDueDate';

describe('EditableDueDate', () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockDueDate = '2025-05-15T00:00:00.000Z';
  const formattedDate = '2025-05-15';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正しく締切日を表示する', () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />);
    
    // 日本語のロケールでの表示形式に合わせる
    expect(screen.getByText('5/15/2025')).toBeInTheDocument();
  });

  it('締切日がnullの場合は「期限を設定」と表示する', () => {
    render(<EditableDueDate dueDate={null} onSave={mockOnSave} />);
    
    expect(screen.getByText('期限を設定')).toBeInTheDocument();
  });

  it('クリックするとインラインカレンダーが表示される', () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />);
    
    const displayElement = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(displayElement);
    
    // インラインカレンダーが表示される
    expect(screen.getByLabelText('締切日')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '締切日をクリア' })).toBeInTheDocument();
  });

  it('日付を変更して保存できる', async () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />);
    
    // 編集モードに切り替え
    const displayElement = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(displayElement);
    
    // 日付を変更
    const dateInput = screen.getByLabelText('締切日');
    fireEvent.change(dateInput, { target: { value: '2025-06-01' } });
    
    // onSaveが正しい値で呼ばれることを確認
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('2025-06-01');
    });
  });

  it('「クリア」ボタンで締切日を削除できる', async () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />);
    
    // 編集モードに切り替え
    const displayElement = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(displayElement);
    
    // クリアボタンをクリック
    const clearButton = screen.getByRole('button', { name: '締切日をクリア' });
    fireEvent.click(clearButton);
    
    // onSaveがnullで呼ばれることを確認
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(null);
    });
  });

  it('disabledがtrueの場合は編集できない', () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} disabled={true} />);
    
    // 編集ボタンが表示されないことを確認
    expect(screen.queryByRole('button', { name: '締切日を編集' })).not.toBeInTheDocument();
    
    // 通常の表示になっていることを確認
    expect(screen.getByText('5/15/2025')).toBeInTheDocument();
  });
});
