import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TaskHeader from './TaskHeader';

// モック関数
const mockToggleCompletion = vi.fn();
const mockDelete = vi.fn();
const mockNavigate = vi.fn();

// react-router-dom の useNavigate をモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TaskHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('タイトルを表示する', () => {
    render(
      <BrowserRouter>
        <TaskHeader
          title="テストタスク"
          isCompleted={false}
          onToggleCompletion={mockToggleCompletion}
          onDelete={mockDelete}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });

  it('未完了タスクの場合、「完了にする」ボタンを表示する', () => {
    render(
      <BrowserRouter>
        <TaskHeader
          title="テストタスク"
          isCompleted={false}
          onToggleCompletion={mockToggleCompletion}
          onDelete={mockDelete}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('完了にする')).toBeInTheDocument();
  });

  it('完了済みタスクの場合、「未完了にする」ボタンを表示する', () => {
    render(
      <BrowserRouter>
        <TaskHeader
          title="テストタスク"
          isCompleted={true}
          onToggleCompletion={mockToggleCompletion}
          onDelete={mockDelete}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('未完了にする')).toBeInTheDocument();
  });

  it('完了状態切り替えボタンをクリックすると onToggleCompletion が呼ばれる', () => {
    render(
      <BrowserRouter>
        <TaskHeader
          title="テストタスク"
          isCompleted={false}
          onToggleCompletion={mockToggleCompletion}
          onDelete={mockDelete}
        />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('完了にする'));
    expect(mockToggleCompletion).toHaveBeenCalledTimes(1);
  });

  it('削除ボタンをクリックすると onDelete が呼ばれる', () => {
    render(
      <BrowserRouter>
        <TaskHeader
          title="テストタスク"
          isCompleted={false}
          onToggleCompletion={mockToggleCompletion}
          onDelete={mockDelete}
        />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('削除'));
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it('「一覧に戻る」ボタンをクリックするとホームページに遷移する', () => {
    render(
      <BrowserRouter>
        <TaskHeader
          title="テストタスク"
          isCompleted={false}
          onToggleCompletion={mockToggleCompletion}
          onDelete={mockDelete}
        />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('一覧に戻る'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
