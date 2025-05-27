/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, beforeEach, describe, it, expect } from 'vitest';
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
vi.mock('../../services/api', () => {
  const mockTask = {
    id: '123',
    title: 'テストタスク',
    completed: false,
    priority: 'medium',
    tags: ['仕事', '重要'],
    dueDate: '2023-12-31',
    memo: '# テストメモ\n\nこれはテストメモです。',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  };
  
  return {
    default: {
      fetchTasks: vi.fn().mockResolvedValue([mockTask]),
      fetchTaskById: vi.fn().mockResolvedValue(mockTask),
      updateTask: vi.fn().mockResolvedValue(mockTask),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      toggleTaskCompletion: vi.fn().mockResolvedValue({
        ...mockTask,
        completed: !mockTask.completed
      }),
      updateTaskMemo: vi.fn().mockResolvedValue({
        ...mockTask,
        memo: '# 更新されたメモ\n\n更新されたテキスト'
      }),
      updateTaskTitle: vi.fn().mockResolvedValue({
        ...mockTask,
        title: '更新されたタスクタイトル'
      })
    }
  };
});

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
  fetchTags: vi.fn().mockResolvedValue({}),
  updateTag: vi.fn().mockResolvedValue({}),
  deleteTag: vi.fn().mockResolvedValue({}),
}));

describe('タスク詳細ページ インテグレーションテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // モックタスクを返すように設定
    (api.fetchTaskById as any).mockResolvedValue({
      id: '123',
      title: 'テストタスク',
      completed: false,
      priority: Priority.Medium,
      tags: ['仕事', '重要'],
      dueDate: '2023-12-31',
      memo: '# テストメモ\n\nこれはテストメモです。',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    });
  });

  const renderTaskDetailPage = () => {
    return render(
      <MemoryRouter initialEntries={['/tasks/123']}>
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

  it('タスク詳細が表示される', async () => {
    renderTaskDetailPage();
    
    // ローディング表示が消えるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('タスクを読み込み中...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // タイトルが表示されていることを確認
    await waitFor(() => {
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
    });
    
    // ボタンが表示されていることを確認（テキストではなくロールとアクセシブルな名前で検索）
    await waitFor(() => {
      const completeButton = screen.getByText('完了にする');
      expect(completeButton).toBeInTheDocument();
    });
  });

  it('タイトルを編集できる', async () => {
    // モックの設定
    (api.updateTaskTitle as any).mockResolvedValue({
      id: '123',
      title: '更新されたタスクタイトル',
      completed: false,
      priority: Priority.Medium,
      tags: ['仕事', '重要'],
      dueDate: '2023-12-31',
      memo: '# テストメモ\n\nこれはテストメモです。',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    });

    renderTaskDetailPage();
    
    // ローディング表示が消えるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('タスクを読み込み中...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // タイトルが表示されていることを確認
    await waitFor(() => {
      expect(screen.getByText('テストタスク')).toBeInTheDocument();
    });
    
    // 編集ボタンが表示されるのを待つ
    await waitFor(() => {
      // data-testidで検索
      const editButton = screen.getByTestId('task-title-display');
      expect(editButton).toBeInTheDocument();
      
      // 編集ボタンをクリック
      fireEvent.click(editButton);
    });
    
    // 入力フィールドが表示されていることを確認
    const titleInput = await screen.findByTestId('task-title-input');
    expect(titleInput).toBeInTheDocument();
    
    // タイトルを編集
    fireEvent.change(titleInput, { target: { value: '更新されたタスクタイトル' } });
    
    // Enterキーを押して保存
    fireEvent.keyDown(titleInput, { key: 'Enter' });
    
    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(api.updateTaskTitle).toHaveBeenCalledWith('123', '更新されたタスクタイトル');
    });
  });
});
