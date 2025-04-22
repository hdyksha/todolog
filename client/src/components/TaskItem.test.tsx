import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskItem from './TaskItem';
import { Task, Priority } from '../types';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    title: 'テストタスク',
    completed: false,
    priority: Priority.Medium,
    category: 'テスト',
    dueDate: '2025-05-01T00:00:00.000Z',
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-04-01T00:00:00.000Z',
  };

  const mockCompletedTask: Task = {
    ...mockTask,
    completed: true,
  };

  const mockToggleComplete = vi.fn();
  const mockDelete = vi.fn();
  const mockEdit = vi.fn();
  const mockEditMemo = vi.fn();

  it('タスクのタイトルが表示される', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });

  it('チェックボックスをクリックするとonToggleCompleteが呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockToggleComplete).toHaveBeenCalledWith('1');
  });

  it('編集ボタンをクリックするとonEditが呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    const editButton = screen.getByRole('button', { name: /編集/ });
    fireEvent.click(editButton);

    expect(mockEdit).toHaveBeenCalledWith(mockTask);
  });

  it('削除ボタンをクリックするとonDeleteが呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /削除/ });
    fireEvent.click(deleteButton);

    expect(mockDelete).toHaveBeenCalledWith('1');
  });

  it('詳細ボタンをクリックするとonEditMemoが呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    const detailButton = screen.getByRole('button', { name: '詳細' });
    fireEvent.click(detailButton);

    expect(mockEditMemo).toHaveBeenCalledWith('1');
  });

  it('アーカイブされたタスクは特別なスタイルで表示される', () => {
    render(
      <TaskItem
        task={mockCompletedTask}
        isArchived={true}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );
    
    // task-archivedクラスが適用されているか確認
    const taskItem = screen.getByTestId('task-item');
    expect(taskItem).toHaveClass('task-archived');
  });
});
