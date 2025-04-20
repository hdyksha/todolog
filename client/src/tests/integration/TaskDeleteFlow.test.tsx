import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import TaskItem from '../../components/TaskItem';
import { Priority, Task } from '../../types';

// テスト用のモックタスク
const mockTask: Task = {
  id: 'test-task-id',
  title: '削除するタスク',
  completed: false,
  priority: Priority.Medium,
  createdAt: new Date('2025-04-15T10:00:00.000Z'),
  updatedAt: new Date('2025-04-15T10:00:00.000Z')
};

// MSWサーバーのセットアップ
const server = setupServer(
  http.delete(`http://localhost:3001/api/tasks/${mockTask.id}`, () => {
    return HttpResponse.json({ success: true });
  })
);

// テスト前にサーバーを起動
beforeAll(() => server.listen());

// 各テスト後にリクエストハンドラーをリセット
afterEach(() => server.resetHandlers());

// すべてのテスト後にサーバーを閉じる
afterAll(() => server.close());

describe('タスク削除フロー', () => {
  it('削除ボタンをクリックするとonDeleteが呼ばれる', async () => {
    // モック関数の準備
    const onToggleComplete = vi.fn();
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskItem 
          task={mockTask} 
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </TaskProvider>
    );
    
    // 削除ボタンをクリック
    fireEvent.click(screen.getByLabelText(/タスクを削除/i));
    
    // 削除関数が呼ばれたことを確認
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockTask.id);
  });
  
  it('編集ボタンをクリックするとonEditが呼ばれる', async () => {
    // モック関数の準備
    const onToggleComplete = vi.fn();
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskItem 
          task={mockTask} 
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </TaskProvider>
    );
    
    // 編集ボタンをクリック
    fireEvent.click(screen.getByLabelText(/タスクを編集/i));
    
    // 編集関数が呼ばれたことを確認
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockTask.id);
  });
  
  it('チェックボックスをクリックするとonToggleCompleteが呼ばれる', async () => {
    // モック関数の準備
    const onToggleComplete = vi.fn();
    const onDelete = vi.fn();
    const onEdit = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TaskItem 
          task={mockTask} 
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </TaskProvider>
    );
    
    // チェックボックスをクリック
    fireEvent.click(screen.getByRole('checkbox'));
    
    // 完了状態切り替え関数が呼ばれたことを確認
    expect(onToggleComplete).toHaveBeenCalledTimes(1);
    expect(onToggleComplete).toHaveBeenCalledWith(mockTask.id);
  });
});
