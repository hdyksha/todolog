import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { axe } from '../../tests/axe-helper';
import TaskForm from './TaskForm';
import { Priority } from '../../types';

describe('TaskForm コンポーネントのアクセシビリティ', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  it('新規作成フォームでアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('編集フォームでアクセシビリティ違反がないこと', async () => {
    const mockTask = {
      id: '1',
      title: 'テストタスク',
      completed: false,
      priority: Priority.Medium,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'テスト',
      dueDate: new Date().toISOString(),
      memo: 'これはテストメモです'
    };

    const { container } = render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('送信中の状態でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
