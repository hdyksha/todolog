import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import TaskForm from './TaskForm';
import { Priority } from '../types';

describe('TaskForm コンポーネント', () => {
  // タグとして使用するデータ
  const mockAvailableTags = {
    '仕事': { color: '#ff0000' },
    '個人': { color: '#00ff00' },
    '買い物': { color: '#0000ff' }
  };
  
  const mockTask = {
    id: '1',
    title: 'テストタスク',
    completed: false,
    priority: Priority.Medium,
    tags: ['仕事'],
    dueDate: '2025-05-01T00:00:00.000Z',
    createdAt: '2025-04-15T10:00:00.000Z',
    updatedAt: '2025-04-15T10:00:00.000Z',
    memo: 'これはテストメモです'
  };
  
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('新規作成モードで正しく表示される', () => {
    render(
      <TaskForm
        availableTags={mockAvailableTags}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // フォームのタイトルが表示されていることを確認
    expect(screen.getByText('新しいタスク')).toBeInTheDocument();
    
    // 入力フィールドが空で表示されていることを確認
    expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
    // 優先度の確認（中が選択されていることを確認）
    expect(screen.getByText('中')).toHaveClass('priority-badge priority-medium active');
    // タグ入力フィールドの確認
    expect(screen.getByText(/タグ/)).toBeInTheDocument();
    expect(screen.getByLabelText(/期限/)).toHaveValue('');
    expect(screen.getByLabelText(/メモ/)).toHaveValue('');
    
    // 完了チェックボックスが表示されていないことを確認
    expect(screen.queryByLabelText(/完了/)).not.toBeInTheDocument();
    
    // ボタンが表示されていることを確認
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
  });

  it('編集モードで正しく表示される', () => {
    render(
      <TaskForm
        task={mockTask}
        availableTags={mockAvailableTags}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // フォームのタイトルが表示されていることを確認
    expect(screen.getByText('タスクを編集')).toBeInTheDocument();
    
    // 入力フィールドに既存のタスクデータが表示されていることを確認
    expect(screen.getByLabelText(/タイトル/)).toHaveValue('テストタスク');
    // 優先度の確認（中が選択されていることを確認）
    expect(screen.getByText('中')).toHaveClass('priority-badge priority-medium active');
    // タグが表示されていることを確認
    expect(screen.getByText(/タグ/)).toBeInTheDocument();
    // 選択されたタグが表示されていることを確認（タグの表示方法に依存）
    expect(screen.getByLabelText(/期限/)).toHaveValue('2025-05-01');
    expect(screen.getByLabelText(/メモ/)).toHaveValue('これはテストメモです');
    
    // 完了チェックボックスが表示されていることを確認
    expect(screen.getByLabelText(/完了/)).toBeInTheDocument();
    expect(screen.getByLabelText(/完了/)).not.toBeChecked();
    
    // ボタンが表示されていることを確認
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('キャンセルボタンをクリックすると onCancel が呼ばれる', () => {
    render(
      <TaskForm
        availableTags={mockAvailableTags}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('キャンセル'));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('タイトルが空の場合はバリデーションエラーが表示される', () => {
    render(
      <TaskForm
        availableTags={mockAvailableTags}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // タイトルを空のままフォームを送信
    fireEvent.click(screen.getByText('作成'));
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    
    // onSaveが呼ばれていないことを確認
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('有効なフォームを送信すると onSave が正しいデータで呼ばれる', () => {
    render(
      <TaskForm
        availableTags={mockAvailableTags}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // フォームに値を入力
    const titleInput = screen.getByLabelText(/タイトル/);
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } });
    
    // 優先度を「高」に変更
    const highPriorityButton = screen.getByText('高');
    fireEvent.click(highPriorityButton);
    
    // タグ入力（実装に依存）
    const tagInput = screen.getByPlaceholderText(/タグを追加/);
    fireEvent.change(tagInput, { target: { value: '個人' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    const dueDateInput = screen.getByLabelText(/期限/);
    fireEvent.change(dueDateInput, { target: { value: '2025-06-01' } });
    
    const memoInput = screen.getByLabelText(/メモ/);
    fireEvent.change(memoInput, { target: { value: 'これは新しいメモです' } });
    
    // フォームを送信
    fireEvent.click(screen.getByText('作成'));
    
    // onSaveが正しいデータで呼ばれたことを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      title: '新しいタスク',
      priority: Priority.High,
      tags: ['個人'],
      dueDate: expect.any(Date),
      memo: 'これは新しいメモです',
      completed: false
    });
  });

  it('編集モードで完了状態を変更できる', () => {
    render(
      <TaskForm
        task={mockTask}
        availableTags={mockAvailableTags}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // 完了チェックボックスをクリック
    const completedCheckbox = screen.getByLabelText(/完了/);
    fireEvent.click(completedCheckbox);
    
    // フォームを送信
    fireEvent.click(screen.getByText('更新'));
    
    // onSaveが正しいデータで呼ばれたことを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      completed: true
    }));
  });

  it('タグを追加できる', () => {
    render(
      <TaskForm
        availableTags={mockAvailableTags}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // タイトルを入力
    const titleInput = screen.getByLabelText(/タイトル/);
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } });
    
    // タグを追加
    const tagInput = screen.getByPlaceholderText(/タグを追加/);
    fireEvent.change(tagInput, { target: { value: '新しいタグ' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // フォームを送信
    fireEvent.click(screen.getByText('作成'));
    
    // onSaveが正しいデータで呼ばれたことを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      tags: ['新しいタグ']
    }));
  });

  it('既存のタグを選択できる', () => {
    render(
      <TaskForm
        availableTags={mockAvailableTags}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // タイトルを入力
    const titleInput = screen.getByLabelText(/タイトル/);
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } });
    
    // タグを追加
    const tagInput = screen.getByPlaceholderText(/タグを追加/);
    fireEvent.change(tagInput, { target: { value: '仕事' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    // フォームを送信
    fireEvent.click(screen.getByText('作成'));
    
    // onSaveが正しいデータで呼ばれたことを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      tags: ['仕事']
    }));
  });
});
