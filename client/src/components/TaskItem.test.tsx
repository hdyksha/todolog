import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from './TaskItem';
import { Task, Priority } from '../types';
import { vi } from 'vitest';

// モックタスクデータ
const mockTask: Task = {
  id: '1',
  title: 'テストタスク',
  completed: false,
  priority: Priority.Medium,
  category: 'テスト',
  dueDate: '2025-05-01',
  createdAt: '2025-04-20T10:00:00Z',
  updatedAt: '2025-04-20T10:00:00Z',
};

// モックハンドラー
const mockHandlers = {
  onToggleComplete: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onEditMemo: vi.fn(),
};

describe('TaskItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('タスクの情報が正しく表示される', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        onEditMemo={mockHandlers.onEditMemo}
      />
    );

    // タイトルが表示されるか確認
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    
    // 優先度が表示されるか確認
    expect(screen.getByText('中')).toBeInTheDocument();
    
    // カテゴリが表示されるか確認
    expect(screen.getByText('テスト')).toBeInTheDocument();
    
    // 期限日が表示されるか確認（フォーマットは環境によって異なる可能性あり）
    const dueDate = new Date('2025-05-01').toLocaleDateString();
    expect(screen.getByText(dueDate)).toBeInTheDocument();
  });

  it('チェックボックスをクリックするとonToggleCompleteが呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        onEditMemo={mockHandlers.onEditMemo}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith('1');
  });

  it('編集ボタンをクリックするとonEditが呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        onEditMemo={mockHandlers.onEditMemo}
      />
    );

    const editButton = screen.getByText('編集');
    fireEvent.click(editButton);
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('削除ボタンをクリックするとonDeleteが呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        onEditMemo={mockHandlers.onEditMemo}
      />
    );

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('詳細ボタンをクリックするとonEditMemoが呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        onEditMemo={mockHandlers.onEditMemo}
      />
    );

    const detailButton = screen.getByText('詳細');
    fireEvent.click(detailButton);
    
    expect(mockHandlers.onEditMemo).toHaveBeenCalledWith('1');
  });

  it('アーカイブされたタスクは特別なスタイルで表示される', () => {
    render(
      <TaskItem
        task={{ ...mockTask, completed: true }}
        isArchived={true}
        onToggleComplete={mockHandlers.onToggleComplete}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
        onEditMemo={mockHandlers.onEditMemo}
      />
    );

    // チェックアイコンが表示されるか確認
    expect(screen.getByText('✓')).toBeInTheDocument();
    
    // task-archivedクラスが適用されているか確認
    const taskItem = screen.getByRole('listitem');
    expect(taskItem).toHaveClass('task-archived');
  });
});
