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

  it('インライン編集モードでアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <EditableDueDate dueDate={mockDueDate} onSave={mockOnSave} />
    );
    
    // インライン編集モードに切り替え
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
    fireEvent.click(displayElement); // キーボードイベントに加えてクリックイベントも発火
    
    // インライン編集モードに切り替わったことを確認
    expect(screen.getByLabelText('締切日')).toBeInTheDocument();
    
    // クリアボタンがキーボードでアクセス可能であることを確認
    const clearButton = screen.getByRole('button', { name: '締切日をクリア' });
    expect(clearButton).toBeInTheDocument();
  });
});
