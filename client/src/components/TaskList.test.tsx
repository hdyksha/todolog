import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      tags: ['カテゴリA'],
      dueDate: '2025-05-01T00:00:00.000Z',
      createdAt: '2025-04-15T10:00:00.000Z',
      updatedAt: '2025-04-15T10:00:00.000Z',
    },
    {
      id: '2',
      title: 'タスク2',
      completed: true,
      priority: Priority.Medium,
      tags: ['カテゴリB'],
      createdAt: '2025-04-16T10:00:00.000Z',
      updatedAt: '2025-04-16T10:00:00.000Z',
    },
    {
      id: '3',
      title: 'タスク3',
      completed: false,
      priority: Priority.Low,
      tags: [],
      createdAt: '2025-04-17T10:00:00.000Z',
      updatedAt: '2025-04-17T10:00:00.000Z',
    },
  ];

  const mockFilter = {
    status: 'all' as const,
    priority: 'all' as const,
    searchTerm: '',
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

  it('タスクが空の場合は「アクティブなタスクはありません」と表示される', () => {
    render(
      <TaskList
        tasks={[]}
        filter={mockFilter}
        sort={mockSort}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('アクティブなタスクはありません')).toBeInTheDocument();
  });

  it('ステータスフィルターが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        {...mockHandlers}
      />
    );

    // ステータスボタンをクリック
    const activeButton = screen.getByText('未完了');
    fireEvent.click(activeButton);

    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      status: 'active',
    });
  });

  it('優先度フィルターが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
        {...mockHandlers}
      />
    );

    // 優先度フィルターを変更
    const priorityFilter = screen.getByLabelText('優先度:');
    fireEvent.change(priorityFilter, { target: { value: 'high' } });

    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      priority: 'high',
    });
  });

  it('カテゴリフィルターが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
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
        {...mockHandlers}
      />
    );

    // 検索フィルターを変更
    const searchInput = screen.getByPlaceholderText('タスクを検索...');
    fireEvent.change(searchInput, { target: { value: '検索テキスト' } });

    expect(mockHandlers.onFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      searchTerm: '検索テキスト',
    });
  });

  it('ソートフィールドが正しく動作する', () => {
    render(
      <TaskList
        tasks={mockTasks}
        filter={mockFilter}
        sort={mockSort}
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
        {...mockHandlers}
      />
    );

    // 完了状態の切り替えボタンをクリック
    const toggleButton = screen.getByLabelText('タスク1を完了としてマーク');
    fireEvent.click(toggleButton);
    expect(mockHandlers.onToggleComplete).toHaveBeenCalled();

    // 編集ボタンをクリック
    const editButton = screen.getByLabelText('タスク1を編集');
    fireEvent.click(editButton);
    expect(mockHandlers.onEditTask).toHaveBeenCalled();

    // 削除ボタンをクリック
    const deleteButton = screen.getByLabelText('タスク1を削除');
    fireEvent.click(deleteButton);
    expect(mockHandlers.onDeleteTask).toHaveBeenCalled();
  });
});
