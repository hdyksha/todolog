import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import { TagProvider } from '../../contexts/TagContext';
import TaskForm from '../../components/TaskForm';
import { Priority } from '../../types';

// TagContextをモック
vi.mock('../../contexts/TagContext', () => ({
  useTagContext: () => ({
    state: {
      tags: {
        '仕事': { color: '#ff0000' },
        '個人': { color: '#00ff00' },
        '買い物': { color: '#0000ff' }
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

describe('タスク作成フロー', () => {
  it('フォーム送信後にタスクが作成される', async () => {
    // モック関数の準備
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskForm 
          onSave={onSubmit} 
          onCancel={onCancel} 
          availableTags={{
            '仕事': { color: '#ff0000' },
            '個人': { color: '#00ff00' },
            '買い物': { color: '#0000ff' }
          }}
        />
      </TaskProvider>
    );
    
    // フォームに値を入力
    const titleInput = screen.getByLabelText(/タイトル/i);
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } });
    
    // 優先度を「高」に変更
    const highPriorityButton = screen.getByText('高');
    fireEvent.click(highPriorityButton);
    
    // タグを追加
    const tagInput = screen.getByLabelText('タグを追加');
    fireEvent.change(tagInput, { target: { value: '仕事' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // 期限を設定
    const dueDateInput = screen.getByLabelText(/期限/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-06-01' } });
    
    // メモを入力
    const memoInput = screen.getByLabelText(/メモ/i);
    fireEvent.change(memoInput, { target: { value: 'これは新しいタスクのメモです' } });
    
    // フォームを送信
    const submitButton = screen.getByText('作成');
    fireEvent.click(submitButton);
    
    // onSubmitが正しいデータで呼ばれたことを確認
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: '新しいタスク',
      priority: Priority.High,
      tags: ['仕事'],
      dueDate: expect.any(Date),
      memo: 'これは新しいタスクのメモです',
      completed: false
    }));
  });
  
  it('バリデーションエラーが表示される', async () => {
    // モック関数の準備
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskForm 
          onSave={onSubmit} 
          onCancel={onCancel} 
          availableTags={{
            '仕事': { color: '#ff0000' },
            '個人': { color: '#00ff00' },
            '買い物': { color: '#0000ff' }
          }}
        />
      </TaskProvider>
    );
    
    // タイトルを空のままフォームを送信
    const submitButton = screen.getByText('作成');
    fireEvent.click(submitButton);
    
    // バリデーションエラーが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/タイトルは必須です/i)).toBeInTheDocument();
    });
    
    // onSubmitが呼ばれていないことを確認
    expect(onSubmit).not.toHaveBeenCalled();
  });
  
  it('キャンセルボタンが機能する', async () => {
    // モック関数の準備
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskForm 
          onSave={onSubmit} 
          onCancel={onCancel} 
          availableTags={{
            '仕事': { color: '#ff0000' },
            '個人': { color: '#00ff00' },
            '買い物': { color: '#0000ff' }
          }}
        />
      </TaskProvider>
    );
    
    // タイトルを入力
    const titleInput = screen.getByLabelText(/タイトル/i);
    fireEvent.change(titleInput, { target: { value: 'キャンセルするタスク' } });
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    // onCancelが呼ばれたことを確認
    expect(onCancel).toHaveBeenCalledTimes(1);
    
    // onSubmitが呼ばれていないことを確認
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
