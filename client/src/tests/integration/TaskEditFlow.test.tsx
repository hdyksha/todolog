import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import TaskForm from '../../components/TaskForm';
import { Priority, Task } from '../../types';

// テスト用のモックタスク
const mockTask: Task = {
  id: 'test-task-id',
  title: '既存のタスク',
  completed: false,
  priority: Priority.Medium,
  createdAt: new Date('2025-04-15T10:00:00.000Z'),
  updatedAt: new Date('2025-04-15T10:00:00.000Z'),
  category: 'テスト',
  dueDate: new Date('2025-05-01T00:00:00.000Z'),
  memo: 'これはテスト用のメモです'
};

// MSWサーバーのセットアップ
const server = setupServer(
  http.get('http://localhost:3001/api/categories', () => {
    return HttpResponse.json(['仕事', '個人', '買い物', 'テスト']);
  })
);

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
          categories={['仕事', '個人', '買い物', 'テスト']} 
          onSave={onSave} 
          onCancel={onCancel} 
        />
      </TaskProvider>
    );
    
    // 各フィールドの値を確認
    expect(screen.getByLabelText(/タイトル/i)).toHaveValue('既存のタスク');
    expect(screen.getByLabelText(/優先度/i)).toHaveValue(Priority.Medium);
    expect(screen.getByLabelText(/カテゴリ/i)).toHaveValue('テスト');
    expect(screen.getByLabelText(/期限/i)).toHaveValue('2025-05-01');
    expect(screen.getByLabelText(/メモ/i)).toHaveValue('これはテスト用のメモです');
    expect(screen.getByLabelText(/完了/i)).not.toBeChecked();
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
          categories={['仕事', '個人', '買い物', 'テスト']} 
          onSave={onSave} 
          onCancel={onCancel} 
        />
      </TaskProvider>
    );
    
    // タイトルを変更
    fireEvent.change(screen.getByLabelText(/タイトル/i), {
      target: { value: '更新されたタスク' }
    });
    
    // 優先度を変更
    fireEvent.change(screen.getByLabelText(/優先度/i), {
      target: { value: Priority.High }
    });
    
    // 完了状態を変更
    fireEvent.click(screen.getByLabelText(/完了/i));
    
    // フォームを送信
    fireEvent.click(screen.getByText('更新'));
    
    // 送信成功を確認
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        id: 'test-task-id',
        title: '更新されたタスク',
        priority: Priority.High,
        completed: true
      }));
    });
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
          categories={['仕事', '個人', '買い物', 'テスト']} 
          onSave={onSave} 
          onCancel={onCancel} 
        />
      </TaskProvider>
    );
    
    // タイトルを空にする
    fireEvent.change(screen.getByLabelText(/タイトル/i), {
      target: { value: '' }
    });
    
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
