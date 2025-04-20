import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import TaskItem from './TaskItem';
import { Priority } from '../types';

describe('TaskItem コンポーネント', () => {
  const mockTask = {
    id: '1',
    title: 'テストタスク',
    completed: false,
    priority: Priority.Medium,
    category: 'テスト',
    dueDate: '2025-05-01T00:00:00.000Z',
    createdAt: '2025-04-15T10:00:00.000Z',
    updatedAt: '2025-04-15T10:00:00.000Z',
    memo: 'これはテストメモです'
  };

  const mockOnToggleComplete = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnEditMemo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('タスク情報が正しく表示される', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );

    // タイトルが表示されていることを確認
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    
    // 優先度が表示されていることを確認
    expect(screen.getByText('中')).toBeInTheDocument();
    
    // カテゴリが表示されていることを確認
    expect(screen.getByText('テスト')).toBeInTheDocument();
    
    // 期限が表示されていることを確認
    expect(screen.getByText(/期限:/)).toBeInTheDocument();
  });

  it('完了状態のタスクは完了スタイルが適用される', () => {
    const completedTask = { ...mockTask, completed: true };
    
    render(
      <TaskItem
        task={completedTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );
    
    const taskItem = screen.getByText('テストタスク').closest('.task-item');
    expect(taskItem).toHaveClass('completed');
  });

  it('チェックボックスをクリックすると onToggleComplete が呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockOnToggleComplete).toHaveBeenCalledWith(mockTask.id);
  });

  it('編集ボタンをクリックすると onEdit が呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );
    
    const editButton = screen.getByLabelText('タスクを編集');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask.id);
  });

  it('削除ボタンをクリックすると onDelete が呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );
    
    const deleteButton = screen.getByLabelText('タスクを削除');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('詳細ボタンをクリックするとタスク詳細が表示される', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    // 初期状態ではメモは表示されていない
    expect(screen.queryByText('これはテストメモです')).not.toBeInTheDocument();
    
    // 詳細ボタンをクリック
    const detailsButton = screen.getByLabelText('詳細を表示');
    fireEvent.click(detailsButton);
    
    // メモが表示されていることを確認
    expect(screen.getByText('これはテストメモです')).toBeInTheDocument();
    // 作成日と更新日が表示されていることを確認
    expect(screen.getByText(/作成日:/)).toBeInTheDocument();
    expect(screen.getByText(/更新日:/)).toBeInTheDocument();
  });

  it('メモ編集ボタンをクリックすると onEditMemo が呼ばれる', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    // 詳細ボタンをクリック
    const detailsButton = screen.getByLabelText('詳細を表示');
    fireEvent.click(detailsButton);
    
    // メモ編集ボタンをクリック
    const editMemoButton = screen.getByText('メモを編集');
    fireEvent.click(editMemoButton);
    
    expect(mockOnEditMemo).toHaveBeenCalledWith(mockTask.id);
  });

  it('メモがない場合は「メモを追加」ボタンが表示される', () => {
    const taskWithoutMemo = { ...mockTask, memo: undefined };
    
    render(
      <TaskItem
        task={taskWithoutMemo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    // 詳細ボタンをクリック
    const detailsButton = screen.getByLabelText('詳細を表示');
    fireEvent.click(detailsButton);
    
    // 「メモはありません」と表示されていることを確認
    expect(screen.getByText('メモはありません')).toBeInTheDocument();
    
    // 「メモを追加」ボタンをクリック
    const addMemoButton = screen.getByText('メモを追加');
    fireEvent.click(addMemoButton);
    
    expect(mockOnEditMemo).toHaveBeenCalledWith(taskWithoutMemo.id);
  });

  it('onEditMemo が提供されていない場合、メモ編集ボタンは表示されない', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );
    
    // 詳細ボタンをクリック
    const detailsButton = screen.getByLabelText('詳細を表示');
    fireEvent.click(detailsButton);
    
    // メモは表示されるが、編集ボタンは表示されない
    expect(screen.getByText('これはテストメモです')).toBeInTheDocument();
    expect(screen.queryByText('メモを編集')).not.toBeInTheDocument();
  });

  it('異なる優先度のタスクは適切なクラスが適用される', () => {
    const priorities = [
      { priority: Priority.High, text: '高', className: 'priority-high' },
      { priority: Priority.Medium, text: '中', className: 'priority-medium' },
      { priority: Priority.Low, text: '低', className: 'priority-low' }
    ];
    
    priorities.forEach(({ priority, text, className }) => {
      const taskWithPriority = { ...mockTask, priority };
      const { unmount } = render(
        <TaskItem
          task={taskWithPriority}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );
      
      const priorityElement = screen.getByText(text);
      expect(priorityElement).toHaveClass(className);
      
      unmount();
    });
  });
});
