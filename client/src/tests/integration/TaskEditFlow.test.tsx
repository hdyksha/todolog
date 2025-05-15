import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import { TagProvider } from '../../contexts/TagContext';
import TaskForm from '../../components/TaskForm';
import { Priority, Task } from '../../types';

// テスト用のモックタスク
const mockTask: Task = {
  id: 'test-task-id',
  title: '既存のタスク',
  completed: false,
  priority: Priority.Medium,
  createdAt: '2025-04-15T10:00:00.000Z',
  updatedAt: '2025-04-15T10:00:00.000Z',
  tags: ['テスト'],
  dueDate: '2025-05-01T00:00:00.000Z',
  memo: 'これはテスト用のメモです'
};

// TagContextをモック
vi.mock('../../contexts/TagContext', () => ({
  useTagContext: () => ({
    state: {
      tags: {
        '仕事': { color: '#ff0000' },
        '個人': { color: '#00ff00' },
        '買い物': { color: '#0000ff' },
        'テスト': { color: '#ffff00' }
      },
      loading: false,
      error: null
    }
  }),
  TagProvider: ({ children }) => children
}));

// MSWサーバーのセットアップ
const server = setupServer();

// テスト前にサーバーを起動
beforeAll(() => server.listen());

// 各テスト後にリクエストハンドラーをリセット
afterEach(() => server.resetHandlers());

// すべてのテスト後にサーバーを閉じる
afterAll(() => server.close());

describe('タスク編集フロー', () => {
  it('既存のタスクデータが正しく表示される', async () => {
    // モック関数の準備
    const onSave = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング（編集モード）
    render(
      <TaskProvider>
        <TaskForm 
          task={mockTask}
          onSave={onSave} 
          onCancel={onCancel} 
          availableTags={{
            '仕事': { color: '#ff0000' },
            '個人': { color: '#00ff00' },
            '買い物': { color: '#0000ff' },
            'テスト': { color: '#ffff00' }
          }}
        />
      </TaskProvider>
    );
    
    // 各フィールドの値を確認
    expect(screen.getByLabelText(/タイトル/i)).toHaveValue('既存のタスク');
    expect(screen.getByText('中')).toHaveClass('priority-badge priority-medium active');
    // タグが表示されていることを確認
    expect(screen.getByText(/タグ/i)).toBeInTheDocument();
    // 選択されたタグ「テスト」が表示されていることを確認
    expect(screen.getByText('テスト')).toBeInTheDocument();
    expect(screen.getByLabelText(/期限/i)).toHaveValue('2025-05-01');
    expect(screen.getByLabelText(/メモ/i)).toHaveValue('これはテスト用のメモです');
  });
  
  it('タスクが正常に更新される', async () => {
    // モック関数の準備
    const onSave = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング（編集モード）
    render(
      <TaskProvider>
        <TaskForm 
          task={mockTask}
          onSave={onSave} 
          onCancel={onCancel} 
          availableTags={{
            '仕事': { color: '#ff0000' },
            '個人': { color: '#00ff00' },
            '買い物': { color: '#0000ff' },
            'テスト': { color: '#ffff00' }
          }}
        />
      </TaskProvider>
    );
    
    // タイトルを変更
    const titleInput = screen.getByLabelText(/タイトル/i);
    fireEvent.change(titleInput, { target: { value: '更新されたタスク' } });
    
    // 優先度を変更
    const highPriorityButton = screen.getByText('高');
    fireEvent.click(highPriorityButton);
    
    // タグを追加（実装に依存）
    // 既存のタグ「テスト」は既に選択されている
    // 新しいタグ「仕事」を追加
    const tagInput = screen.getByLabelText('タグを追加');
    fireEvent.change(tagInput, { target: { value: '仕事' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 期限を変更
    const dueDateInput = screen.getByLabelText(/期限/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-06-01' } });
    
    // メモを変更
    const memoInput = screen.getByLabelText(/メモ/i);
    fireEvent.change(memoInput, { target: { value: '更新されたメモです' } });
    
    // フォームを送信
    fireEvent.click(screen.getByText('更新'));
    
    // onSaveが正しいデータで呼ばれたことを確認
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      id: 'test-task-id',
      title: '更新されたタスク',
      priority: Priority.High,
      tags: expect.arrayContaining(['テスト', '仕事']),
      dueDate: expect.any(Date),
      memo: '更新されたメモです'
    }));
  });
  
  it('バリデーションエラーが表示される', async () => {
    // モック関数の準備
    const onSave = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング（編集モード）
    render(
      <TaskProvider>
        <TaskForm 
          task={mockTask}
          onSave={onSave} 
          onCancel={onCancel} 
          availableTags={{
            '仕事': { color: '#ff0000' },
            '個人': { color: '#00ff00' },
            '買い物': { color: '#0000ff' },
            'テスト': { color: '#ffff00' }
          }}
        />
      </TaskProvider>
    );
    
    // タイトルを空に変更
    const titleInput = screen.getByLabelText(/タイトル/i);
    fireEvent.change(titleInput, { target: { value: '' } });
    
    // フォームを送信
    fireEvent.click(screen.getByText('更新'));
    
    // バリデーションエラーが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/タイトルは必須です/i)).toBeInTheDocument();
    });
    
    // onSaveが呼ばれていないことを確認
    expect(onSave).not.toHaveBeenCalled();
  });
});
