import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import TaskForm from './TaskForm';
import { testKeyboardNavigation } from '../../tests/keyboard-navigation-helper';

describe('TaskForm コンポーネントのキーボードナビゲーション', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  it('Tabキーでフォーム要素間を移動できること', () => {
    const { container } = render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    testKeyboardNavigation(container);
  });

  it('編集モードでもTabキーでフォーム要素間を移動できること', () => {
    const mockTask = {
      id: '1',
      title: 'テストタスク',
      completed: false,
      priority: 'medium' as const,
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

    testKeyboardNavigation(container);
  });
});
