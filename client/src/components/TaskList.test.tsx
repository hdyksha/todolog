import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import TaskList from './TaskList';
import { Priority } from '../types';

describe('TaskList コンポーネント', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'タスク1',
      completed: false,
      priority: Priority.High,
      category: 'カテゴリA',
      dueDate: '2025-05-01T00:00:00.000Z',
      createdAt: '2025-04-15T10:00:00.000Z',
      updatedAt: '2025-04-15T10:00:00.000Z',
    },
    {
      id: '2',
      title: 'タスク2',
      completed: true,
      priority: Priority.Medium,
      category: 'カテゴリB',
      createdAt: '2025-04-16T10:00:00.000Z',
      updatedAt: '2025-04-16T10:00:00.000Z',
    },
    {
      id: '3',
      title: 'タスク3',
      completed: false,
      priority: Priority.Low,
      createdAt: '2025-04-17T10:00:00.000Z',
      updatedAt: '2025-04-17T10:00:00.000Z',
    },
  ];

  const mockCategories = ['カテゴリA', 'カテゴリB', 'カテゴリC'];

  const mockFilter = {
    status: 'all' as const,
    priority: undefined,
    category: undefined,
    searchTerm: undefined,
  };

  const mockSort = {
    field: 'createdAt' as const,
    direction: 'desc' as const,
  };

  const mockHandlers = {
    onToggleComplete: vi.fn(),
    onDeleteTask: vi.fn(),
    onEditTask: vi.fn(),
    onEditMemo: vi.fn(),
    onFilterChange: vi.fn(),
    onSortChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('タスク一覧が正しく表示される', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    // タスク一覧のヘッダーが表示されていることを確認
    expect(screen.getByText('タスク一覧')).toBeInTheDocument();

    // 各タスクが表示されていることを確認
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
    expect(screen.getByText('タスク3')).toBeInTheDocument();
  });

  it('タスクが空の場合は「タスクがありません」と表示される', () => {
    render(
      <TaskList
        tasks={[]}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  it('ステータスフィルターが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    // 「未完了」ボタンをクリック
    fireEvent.click(screen.getByText('未完了'));
    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      status: 'active',
    });

    // 「完了済み」ボタンをクリック
    fireEvent.click(screen.getByText('完了済み'));
    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      status: 'completed',
    });

    // 「すべて」ボタンをクリック（ボタンを特定するためにroleとclassを使用）
    const allButton = screen.getByRole('button', { name: /すべて/ });
    fireEvent.click(allButton);
    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      status: 'all',
    });
  });

  it('優先度フィルターが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    // 優先度フィルターを変更
    const priorityFilter = screen.getByLabelText('優先度:');
    fireEvent.change(priorityFilter, { target: { value: Priority.High } });

    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      priority: Priority.High,
    });
  });

  it('カテゴリフィルターが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    // カテゴリフィルターを変更
    const categoryFilter = screen.getByLabelText('カテゴリ:');
    fireEvent.change(categoryFilter, { target: { value: 'カテゴリA' } });

    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      category: 'カテゴリA',
    });
  });

  it('検索フィルターが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    // 検索フィルターを変更
    const searchFilter = screen.getByPlaceholderText('タスクを検索...');
    fireEvent.change(searchFilter, { target: { value: 'タスク1' } });

    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      searchTerm: 'タスク1',
    });
  });

  it('ソートフィールドが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    // ソートフィールドを変更
    const sortField = screen.getByLabelText('並び替え:');
    fireEvent.change(sortField, { target: { value: 'title' } });

    expect(mockHandlers.onSortChange).toHaveBeenCalledWith({
      ...mockSort,
      field: 'title',
    });
  });

  it('ソート方向ボタンが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    // ソート方向ボタンをクリック
    const sortDirectionButton = screen.getByText('↓');
    fireEvent.click(sortDirectionButton);

    expect(mockHandlers.onSortChange).toHaveBeenCalledWith({
      ...mockSort,
      direction: 'asc',
    });
  });

  it('タスクアイテムのイベントハンドラーが正しく渡される', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    // タスク1のチェックボックスをクリック
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith('1');
  });
});
