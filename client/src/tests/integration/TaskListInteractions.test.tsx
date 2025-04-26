/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { TaskProvider } from '../../contexts/TaskContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ServerSettingsProvider } from '../../contexts/ServerSettingsContext';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { TaskFilesProvider } from '../../contexts/TaskFilesContext';
import { TagProvider } from '../../contexts/TagContext';
import HomePage from '../../pages/HomePage';
import { mockTasks } from '../mocks/taskMocks';
import api from '../../services/api';

// モックナビゲーション関数
const mockNavigate = vi.fn();

// react-router-domのuseNavigateをモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

// APIのモック
vi.mock('../../services/api', () => ({
  default: {
    fetchTasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn().mockResolvedValue({}),
    updateTask: vi.fn().mockResolvedValue({}),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    toggleTaskCompletion: vi.fn().mockResolvedValue({}),
    searchTasks: vi.fn().mockResolvedValue([]),
    fetchTags: vi.fn().mockResolvedValue({}),
    fetchServerSettings: vi.fn().mockResolvedValue({}),
    updateServerSettings: vi.fn().mockResolvedValue({}),
    fetchTaskFiles: vi.fn().mockResolvedValue([]),
    fetchRecentFiles: vi.fn().mockResolvedValue([]),
    getCurrentFileName: vi.fn().mockResolvedValue('tasks.json'),
    switchTaskFile: vi.fn().mockResolvedValue(undefined),
    createTaskFile: vi.fn().mockResolvedValue(undefined),
    deleteTaskFile: vi.fn().mockResolvedValue(undefined)
  }
}));

// ServerSettingsContextのモック
vi.mock('../../contexts/ServerSettingsContext', () => ({
  ServerSettingsProvider: ({ children }) => children,
  useServerSettings: () => ({
    serverSettings: {},
    isLoading: false,
    error: null,
    updateServerSettings: vi.fn(),
    refreshServerSettings: vi.fn()
  })
}));

// SettingsContextのモック
vi.mock('../../contexts/SettingsContext', () => ({
  SettingsProvider: ({ children }) => children,
  useSettings: () => ({
    settings: {
      theme: 'light',
      showArchived: true,
      defaultView: 'list',
      sortField: 'createdAt',
      sortDirection: 'desc'
    },
    updateSettings: vi.fn()
  })
}));

describe('タスク一覧ページ インテグレーションテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // APIモックのリセット
    api.fetchTasks.mockResolvedValue(mockTasks);
    api.createTask.mockImplementation((taskData) => 
      Promise.resolve({ ...taskData, id: 'new-task-id', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    );
    api.toggleTaskCompletion.mockImplementation((id) => {
      const task = mockTasks.find(t => t.id === id);
      if (!task) return Promise.reject(new Error('Task not found'));
      return Promise.resolve({ ...task, completed: !task.completed });
    });
  });

  const renderHomePage = () => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <SettingsProvider>
            <ServerSettingsProvider>
              <NotificationProvider>
                <KeyboardShortcutsProvider>
                  <TaskProvider>
                    <TaskFilesProvider>
                      <TagProvider>
                        <HomePage />
                      </TagProvider>
                    </TaskFilesProvider>
                  </TaskProvider>
                </KeyboardShortcutsProvider>
              </NotificationProvider>
            </ServerSettingsProvider>
          </SettingsProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('タスク一覧が表示される', async () => {
    renderHomePage();

    // アクティブなタスク（未完了タスク）のみが表示されることを確認
    await waitFor(() => {
      // mockTasks[0] - テストタスク (未完了)
      expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
      // mockTasks[2] - 優先度低タスク (未完了)
      expect(screen.getByText(mockTasks[2].title)).toBeInTheDocument();
      // mockTasks[3] - 期限切れタスク (未完了)
      expect(screen.getByText(mockTasks[3].title)).toBeInTheDocument();
      // mockTasks[4] - タグなしタスク (未完了)
      expect(screen.getByText(mockTasks[4].title)).toBeInTheDocument();
      
      // mockTasks[1]は完了済みタスクなのでアクティブリストには表示されない
      expect(screen.queryByText(mockTasks[1].title)).not.toBeInTheDocument();
    });
  });

  it('クイック追加でタスクを作成できる', async () => {
    renderHomePage();

    // クイック追加フォームが表示されるまで待機
    const input = await screen.findByPlaceholderText(/新しいタスクを入力/i);
    
    // タスクを入力
    fireEvent.change(input, { target: { value: '新しいテストタスク' } });
    
    // 追加ボタンをクリック
    const addButton = screen.getByRole('button', { name: /追加/i });
    fireEvent.click(addButton);

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: '新しいテストタスク' })
      );
    });
  });

  it('タスクの完了状態を切り替えることができる', async () => {
    renderHomePage();

    // タスク一覧が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
    });

    // 特定のタスクのチェックボックスを取得
    const checkbox = screen.getByLabelText(`${mockTasks[0].title}を完了としてマーク`);
    fireEvent.click(checkbox);

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(api.toggleTaskCompletion).toHaveBeenCalledWith(mockTasks[0].id);
    });
  });

  it('タスクをクリックすると詳細ページに遷移する', async () => {
    renderHomePage();

    // タスク一覧が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
    });

    // タスクをクリック
    fireEvent.click(screen.getByText(mockTasks[0].title));

    // 詳細ページに遷移することを確認
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${mockTasks[0].id}`);
    });
  });

  it('フィルターを適用できる', async () => {
    renderHomePage();

    // タスク一覧が表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
    });

    // 詳細フィルターボタンを取得して展開
    const filterButton = screen.getByRole('button', { name: /詳細フィルター/i });
    fireEvent.click(filterButton);
    
    // 優先度「高」のフィルターを使用してテスト
    const priorityHighButton = screen.getByText('高');
    fireEvent.click(priorityHighButton);

    // フィルターが適用されることを確認
    // 注: 実際のフィルタリングはクライアント側で行われるため、APIの呼び出しはありません
    await waitFor(() => {
      // 優先度「高」のタスクのみが表示されることを確認
      expect(screen.queryByText('条件に一致するアクティブなタスクはありません')).toBeInTheDocument();
    });
  });
});
