import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from './TaskForm';
import { Priority, Task } from '../../types';
import { TaskProvider } from '../../contexts/TaskContext';
import { vi } from 'vitest';

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
  })
}));

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

// モック関数
const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

// Inputコンポーネントをモック
vi.mock('../../components/ui/Input', () => ({
  default: ({ id, label, value, onChange, placeholder, required, error, disabled, autoFocus }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        disabled={disabled}
        autoFocus={autoFocus}
        className="input"
      />
      {error && <div className="error">{error}</div>}
    </div>
  )
}));

describe('TaskForm キーボード操作', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('送信ボタンでフォームを送信できる', () => {
    render(
      <TaskProvider>
        <TaskForm 
          onSubmit={mockOnSubmit} 
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
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'キーボードテスト'
    }));
  });

  test('キャンセルボタンでフォームをキャンセルできる', () => {
    render(
      <TaskProvider>
        <TaskForm 
          onSubmit={mockOnSubmit} 
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
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
