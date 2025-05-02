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

  it('締切日がnullの場合は「期限なし」と表示する', () => {
    render(<EditableDueDate dueDate={null} onSave={mockOnSave} />);
    
    expect(screen.getByText('期限なし')).toBeInTheDocument();
  });

  it('クリックすると編集モードになる', () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />);
    
    const displayElement = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(displayElement);
    
    // 編集モードでは日付入力が表示される
    expect(screen.getByLabelText('締切日')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '締切日を保存' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('日付を変更して保存できる', async () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />);
    
    // 編集モードに切り替え
    const displayElement = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(displayElement);
    
    // 日付を変更
    const dateInput = screen.getByLabelText('締切日');
    fireEvent.change(dateInput, { target: { value: '2025-06-01' } });
    
    // 保存ボタンをクリック
    const saveButton = screen.getByRole('button', { name: '締切日を保存' });
    fireEvent.click(saveButton);
    
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
    const clearButton = screen.getByRole('button', { name: '締切日を削除' });
    fireEvent.click(clearButton);
    
    // 保存ボタンをクリック
    const saveButton = screen.getByRole('button', { name: '締切日を保存' });
    fireEvent.click(saveButton);
    
    // onSaveがnullで呼ばれることを確認
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(null);
    });
  });

  it('キャンセルボタンで編集をキャンセルできる', () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />);
    
    // 編集モードに切り替え
    const displayElement = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(displayElement);
    
    // 日付を変更
    const dateInput = screen.getByLabelText('締切日');
    fireEvent.change(dateInput, { target: { value: '2025-06-01' } });
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);
    
    // 表示モードに戻ることを確認
    expect(screen.queryByLabelText('締切日')).not.toBeInTheDocument();
    expect(screen.getByText('5/15/2025')).toBeInTheDocument();
    
    // onSaveが呼ばれないことを確認
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('disabledがtrueの場合は編集できない', () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} disabled={true} />);
    
    // 編集ボタンが表示されないことを確認
    expect(screen.queryByRole('button', { name: '締切日を編集' })).not.toBeInTheDocument();
    
    // 通常の表示になっていることを確認
    expect(screen.getByText('5/15/2025')).toBeInTheDocument();
  });
});
