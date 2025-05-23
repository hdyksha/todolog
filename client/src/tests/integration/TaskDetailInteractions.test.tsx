/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import TaskDetailPage from '../../pages/TaskDetailPage';
import { TaskProvider } from '../../contexts/TaskContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';
import { TagProvider } from '../../contexts/TagContext';
import { mockTask } from '../mocks/taskMocks';
import api from '../../services/api';
import { Priority } from '../../types';

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
    fetchTaskById: vi.fn().mockResolvedValue({}),
    updateTask: vi.fn().mockResolvedValue({}),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    toggleTaskCompletion: vi.fn().mockResolvedValue({}),
    updateTaskMemo: vi.fn().mockResolvedValue({})
  }
}));

// MarkdownHelpModalのモック
vi.mock('../../components/MarkdownHelpModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="markdown-help-modal">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

// タグサービスのモック
vi.mock('../../services/tagService', () => ({
  tagService: {
    getAllTags: vi.fn().mockResolvedValue({}),
    getTag: vi.fn().mockResolvedValue({}),
    createTag: vi.fn().mockResolvedValue({}),
    updateTag: vi.fn().mockResolvedValue({}),
    deleteTag: vi.fn().mockResolvedValue({})
  }
}));

describe('TaskDetailPage インテグレーションテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // APIモックのリセット
    api.fetchTasks.mockResolvedValue([mockTask]);
    api.fetchTaskById.mockResolvedValue(mockTask);
    api.updateTask.mockImplementation((id, updates) => Promise.resolve({ ...mockTask, ...updates }));
    api.deleteTask.mockResolvedValue(undefined);
    api.toggleTaskCompletion.mockResolvedValue({ ...mockTask, completed: !mockTask.completed });
    api.updateTaskMemo.mockImplementation((id, memo) => Promise.resolve({ ...mockTask, memo }));
  });

  const renderTaskDetailPage = () => {
    return render(
      <MemoryRouter initialEntries={[`/tasks/${mockTask.id}`]}>
        <NotificationProvider>
          <KeyboardShortcutsProvider>
            <TagProvider>
              <TaskProvider>
                <Routes>
                  <Route path="/tasks/:id" element={<TaskDetailPage />} />
                </Routes>
              </TaskProvider>
            </TagProvider>
          </KeyboardShortcutsProvider>
        </NotificationProvider>
      </MemoryRouter>
    );
  };

  it('タスクの詳細が正しく表示される', async () => {
    renderTaskDetailPage();

    // タスクのタイトルが表示されることを確認
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockTask.title })).toBeInTheDocument();
    });

    // タスクのメタデータが表示されることを確認
    expect(screen.getByText('未完了')).toBeInTheDocument();
    expect(screen.getByText('中')).toBeInTheDocument();
  });

  it('タスクの完了状態を切り替えることができる', async () => {
    renderTaskDetailPage();

    // タスクのタイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockTask.title })).toBeInTheDocument();
    });

    // 完了状態切り替えボタンをクリック
    const toggleButton = screen.getByRole('button', { name: /完了にする/i });
    fireEvent.click(toggleButton);

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(api.toggleTaskCompletion).toHaveBeenCalledWith(mockTask.id);
    });
  });

  it('タスクを削除できる', async () => {
    // window.confirmをモック
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockReturnValue(true);
    
    renderTaskDetailPage();

    // タスクのタイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockTask.title })).toBeInTheDocument();
    });

    // 削除ボタンをクリック - より具体的なセレクタを使用
    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    const taskDeleteButton = deleteButtons.find(button => 
      button.classList.contains('button-danger')
    );
    
    if (!taskDeleteButton) {
      throw new Error('タスク削除ボタンが見つかりません');
    }
    
    fireEvent.click(taskDeleteButton);

    // 確認ダイアログが表示されることを確認
    expect(confirmSpy).toHaveBeenCalled();

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(api.deleteTask).toHaveBeenCalledWith(mockTask.id);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    
    // スパイをリストア
    confirmSpy.mockRestore();
  });

  it('メモを編集できる', async () => {
    renderTaskDetailPage();

    // タスクのタイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockTask.title })).toBeInTheDocument();
    });

    // メモセクションの編集ボタンを特定して取得
    const editButtons = screen.getAllByRole('button', { name: /編集/i });
    // メモセクションの編集ボタンは通常2番目のボタン
    const memoEditButton = editButtons.find(button => 
      button.closest('.task-detail-memo-actions')
    );
    
    if (!memoEditButton) {
      throw new Error('メモ編集ボタンが見つかりません');
    }
    
    fireEvent.click(memoEditButton);

    // テキストエリアが表示されることを確認
    const textarea = await screen.findByPlaceholderText('メモを入力...');
    expect(textarea).toBeInTheDocument();

    // メモを編集
    fireEvent.change(textarea, { target: { value: '更新されたメモ内容' } });

    // 保存ボタンをクリック
    const saveButton = screen.getByRole('button', { name: /保存/i });
    fireEvent.click(saveButton);

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(api.updateTaskMemo).toHaveBeenCalledWith(
        mockTask.id,
        '更新されたメモ内容'
      );
    });
  });

  it('優先度をインラインで変更できる', async () => {
    renderTaskDetailPage();

    // タスクのタイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockTask.title })).toBeInTheDocument();
    });

    // 優先度「高」をクリック
    const highPriorityButton = screen.getByRole('button', { name: '優先度を高に設定' });
    fireEvent.click(highPriorityButton);

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({ priority: Priority.High })
      );
    });
  });

  it('締切日をインラインで変更できる', async () => {
    renderTaskDetailPage();

    // タスクのタイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockTask.title })).toBeInTheDocument();
    });

    // 締切日の編集ボタンをクリック
    const dueDateButton = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(dueDateButton);

    // 日付入力が表示されることを確認
    const dateInput = screen.getByLabelText('締切日');
    expect(dateInput).toBeInTheDocument();

    // 日付を変更
    fireEvent.change(dateInput, { target: { value: '2025-06-01' } });

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({ dueDate: '2025-06-01' })
      );
    });
  });

  it('締切日をクリアできる', async () => {
    renderTaskDetailPage();

    // タスクのタイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockTask.title })).toBeInTheDocument();
    });

    // 締切日の編集ボタンをクリック
    const dueDateButton = screen.getByRole('button', { name: '締切日を編集' });
    fireEvent.click(dueDateButton);

    // クリアボタンをクリック
    const clearButton = screen.getByRole('button', { name: '締切日をクリア' });
    fireEvent.click(clearButton);

    // APIが呼び出されたことを確認
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({ dueDate: null })
      );
    });
  });

  it('マークダウンヘルプを表示できる', async () => {
    renderTaskDetailPage();

    // タスクのタイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockTask.title })).toBeInTheDocument();
    });

    // メモセクションの編集ボタンを特定して取得
    const editButtons = screen.getAllByRole('button', { name: /編集/i });
    // メモセクションの編集ボタンは通常2番目のボタン
    const memoEditButton = editButtons.find(button => 
      button.closest('.task-detail-memo-actions')
    );
    
    if (!memoEditButton) {
      throw new Error('メモ編集ボタンが見つかりません');
    }
    
    fireEvent.click(memoEditButton);

    // ヘルプボタンをクリック
    const helpButton = screen.getByRole('button', { name: /ヘルプ/i });
    fireEvent.click(helpButton);

    // ヘルプモーダルが表示されることを確認
    expect(screen.getByTestId('markdown-help-modal')).toBeInTheDocument();

    // モーダルを閉じる
    const closeButton = screen.getByRole('button', { name: /閉じる/i });
    fireEvent.click(closeButton);

    // モーダルが閉じることを確認
    await waitFor(() => {
      expect(screen.queryByTestId('markdown-help-modal')).not.toBeInTheDocument();
    });
  });
});
