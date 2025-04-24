import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from '../../components/TaskForm';
import { Priority, Task } from '../../types';
import { TaskProvider } from '../../contexts/TaskContext';
import { vi } from 'vitest';

// モックタスク
const mockTask: Task = {
  id: '1',
  title: 'テストタスク',
  completed: false,
  priority: Priority.Medium,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  tags: ['仕事']
};

// モックタグデータ
const mockAvailableTags = {
  '仕事': { color: '#ff0000' },
  '個人': { color: '#00ff00' },
  '買い物': { color: '#0000ff' }
};

// モック関数
const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();

describe('TaskForm キーボード操作', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('送信ボタンでフォームを送信できる', () => {
    render(
      <TaskProvider>
        <TaskForm 
          availableTags={mockAvailableTags}
          onSave={mockOnSave} 
          onCancel={mockOnCancel} 
        />
      </TaskProvider>
    );
    
    // タイトルを入力
    const titleInput = screen.getByLabelText(/タイトル/i);
    fireEvent.change(titleInput, { target: { value: 'キーボードテスト' } });
    
    // 送信ボタンをクリック
    const submitButton = screen.getByText('作成');
    fireEvent.click(submitButton);
    
    // 送信関数が呼ばれたことを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'キーボードテスト'
    }));
  });

  test('キャンセルボタンでフォームをキャンセルできる', () => {
    render(
      <TaskProvider>
        <TaskForm 
          availableTags={mockAvailableTags}
          onSave={mockOnSave} 
          onCancel={mockOnCancel} 
        />
      </TaskProvider>
    );
    
    // タイトルを入力
    const titleInput = screen.getByLabelText(/タイトル/i);
    fireEvent.change(titleInput, { target: { value: 'キャンセルテスト' } });
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    // キャンセル関数が呼ばれたことを確認
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
