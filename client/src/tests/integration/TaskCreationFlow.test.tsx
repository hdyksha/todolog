import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import TaskForm from '../../components/TaskForm';
import { Priority } from '../../types';

// モックタグデータ
const mockAvailableTags = {
  '仕事': { color: '#ff0000' },
  '個人': { color: '#00ff00' },
  '買い物': { color: '#0000ff' }
};

// MSWサーバーのセットアップ
const server = setupServer(
  http.post('http://localhost:3001/api/tasks', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-task-id',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { status: 201 });
  }),
  
  http.get('http://localhost:3001/api/tags', () => {
    return HttpResponse.json(mockAvailableTags);
  })
);

// テスト前にサーバーを起動
beforeAll(() => server.listen());

// 各テスト後にリクエストハンドラーをリセット
afterEach(() => server.resetHandlers());

// すべてのテスト後にサーバーを閉じる
afterAll(() => server.close());

describe('タスク作成フロー', () => {
  it('フォーム送信後にタスクが作成される', async () => {
    // モック関数の準備
    const onSave = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskForm 
          availableTags={mockAvailableTags} 
          onSave={onSave} 
          onCancel={onCancel} 
        />
      </TaskProvider>
    );
    
    // フォームに入力
    fireEvent.change(screen.getByLabelText(/タイトル/i), {
      target: { value: '新しいテストタスク' }
    });
    
    // 優先度を選択
    fireEvent.change(screen.getByLabelText(/優先度/i), {
      target: { value: Priority.High }
    });
    
    // タグを追加
    const tagInput = screen.getByLabelText('タグを追加');
    fireEvent.change(tagInput, { target: { value: '仕事' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // フォームを送信
    const saveButton = screen.getByText('作成');
    fireEvent.click(saveButton);
    
    // 送信成功を確認
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        title: '新しいテストタスク',
        priority: Priority.High,
        tags: ['仕事']
      }));
    });
  });
  
  it('バリデーションエラーが表示される', async () => {
    // モック関数の準備
    const onSave = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskForm 
          availableTags={mockAvailableTags} 
          onSave={onSave} 
          onCancel={onCancel} 
        />
      </TaskProvider>
    );
    
    // タイトルを空のままフォームを送信
    const saveButton = screen.getByText('作成');
    fireEvent.click(saveButton);
    
    // バリデーションエラーが表示されることを確認
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    
    // onSaveが呼ばれていないことを確認
    expect(onSave).not.toHaveBeenCalled();
  });
  
  it('キャンセルボタンが機能する', async () => {
    // モック関数の準備
    const onSave = vi.fn();
    const onCancel = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskForm 
          availableTags={mockAvailableTags} 
          onSave={onSave} 
          onCancel={onCancel} 
        />
      </TaskProvider>
    );
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    // onCancelが呼ばれたことを確認
    expect(onCancel).toHaveBeenCalledTimes(1);
    
    // onSaveが呼ばれていないことを確認
    expect(onSave).not.toHaveBeenCalled();
  });
});
