/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, expect } from 'vitest';
import EditableDueDate from './EditableDueDate';

expect.extend(toHaveNoViolations);

describe('EditableDueDate アクセシビリティテスト', () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockDueDate = '2025-05-15T00:00:00.000Z';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('表示モードでアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('編集モードでアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />
    );
    
    // 編集モードに切り替え
    const displayElement = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(displayElement);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('キーボードでアクセス可能であること', () => {
    render(<EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />);
    
    // 表示要素がキーボードでフォーカス可能であることを確認
    const displayElement = screen.getByRole('button', { name: '締切日を編集' });
    expect(displayElement).toHaveAttribute('tabIndex', '0');
    
    // キーボードでクリック（Enter）
    fireEvent.keyDown(displayElement, { key: 'Enter', code: 'Enter' });
    
    // 編集モードに切り替わったことを確認
    expect(screen.getByLabelText('締切日')).toBeInTheDocument();
    
    // 保存ボタンと取り消しボタンがキーボードでアクセス可能であることを確認
    const saveButton = screen.getByRole('button', { name: '締切日を保存' });
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });
});
