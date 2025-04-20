import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import TaskForm from './TaskForm';
import { Priority } from '../types';

describe('TaskForm コンポーネント', () => {
  const mockCategories = ['仕事', '個人', '買い物'];
  
  const mockTask = {
    id: '1',
    title: 'テストタスク',
    completed: false,
    priority: Priority.Medium,
    category: '仕事',
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
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // フォームのタイトルが表示されていることを確認
    expect(screen.getByText('新しいタスク')).toBeInTheDocument();
    
    // 入力フィールドが空で表示されていることを確認
    expect(screen.getByLabelText(/タイトル/)).toHaveValue('');
    expect(screen.getByLabelText(/優先度/)).toHaveValue(Priority.Medium);
    expect(screen.getByLabelText(/カテゴリ/)).toHaveValue('');
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
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // フォームのタイトルが表示されていることを確認
    expect(screen.getByText('タスクを編集')).toBeInTheDocument();
    
    // 入力フィールドに既存の値が表示されていることを確認
    expect(screen.getByLabelText(/タイトル/)).toHaveValue('テストタスク');
    expect(screen.getByLabelText(/優先度/)).toHaveValue(Priority.Medium);
    expect(screen.getByLabelText(/カテゴリ/)).toHaveValue('仕事');
    expect(screen.getByLabelText(/期限/)).toHaveValue('2025-05-01');
    expect(screen.getByLabelText(/メモ/)).toHaveValue('これはテストメモです');
    
    // 完了チェックボックスが表示されていることを確認
    const completedCheckbox = screen.getByLabelText(/完了/);
    expect(completedCheckbox).toBeInTheDocument();
    expect(completedCheckbox).not.toBeChecked();
    
    // ボタンが表示されていることを確認
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('キャンセルボタンをクリックすると onCancel が呼ばれる', () => {
    render(
      <TaskForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('タイトルが空の場合はバリデーションエラーが表示される', () => {
    render(
      <TaskForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // タイトルを空にする
    const titleInput = screen.getByLabelText(/タイトル/);
    fireEvent.change(titleInput, { target: { value: '' } });
    
    // フォームを送信
    const saveButton = screen.getByText('作成');
    fireEvent.click(saveButton);
    
    // エラーメッセージが表示されることを確認
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    
    // onSaveが呼ばれていないことを確認
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('有効なフォームを送信すると onSave が正しいデータで呼ばれる', () => {
    render(
      <TaskForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // フォームに値を入力
    const titleInput = screen.getByLabelText(/タイトル/);
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } });
    
    const prioritySelect = screen.getByLabelText(/優先度/);
    fireEvent.change(prioritySelect, { target: { value: Priority.High } });
    
    const categorySelect = screen.getByLabelText(/カテゴリ/);
    fireEvent.change(categorySelect, { target: { value: '個人' } });
    
    const dueDateInput = screen.getByLabelText(/期限/);
    fireEvent.change(dueDateInput, { target: { value: '2025-06-01' } });
    
    const memoTextarea = screen.getByLabelText(/メモ/);
    fireEvent.change(memoTextarea, { target: { value: '新しいメモ' } });
    
    // フォームを送信
    const saveButton = screen.getByText('作成');
    fireEvent.click(saveButton);
    
    // onSaveが正しいデータで呼ばれることを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      title: '新しいタスク',
      priority: Priority.High,
      category: '個人',
      dueDate: expect.any(Date),
      memo: '新しいメモ',
      completed: false,
    });
  });

  it('編集モードで完了状態を変更できる', () => {
    render(
      <TaskForm
        task={mockTask}
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // 完了チェックボックスをクリック
    const completedCheckbox = screen.getByLabelText(/完了/);
    fireEvent.click(completedCheckbox);
    
    // フォームを送信
    const saveButton = screen.getByText('更新');
    fireEvent.click(saveButton);
    
    // onSaveが正しいデータで呼ばれることを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      title: 'テストタスク',
      completed: true,
    }));
  });

  it('新しいカテゴリを作成できる', () => {
    render(
      <TaskForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // 「新しいカテゴリを作成」ボタンをクリック
    const newCategoryButton = screen.getByText('新しいカテゴリを作成');
    fireEvent.click(newCategoryButton);
    
    // 新しいカテゴリ入力フィールドが表示されることを確認
    const newCategoryInput = screen.getByPlaceholderText('新しいカテゴリ名');
    expect(newCategoryInput).toBeInTheDocument();
    
    // 新しいカテゴリ名を入力
    fireEvent.change(newCategoryInput, { target: { value: '新カテゴリ' } });
    
    // タイトルを入力
    const titleInput = screen.getByLabelText(/タイトル/);
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } });
    
    // フォームを送信
    const saveButton = screen.getByText('作成');
    fireEvent.click(saveButton);
    
    // onSaveが正しいデータで呼ばれることを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: '新しいタスク',
      category: '新カテゴリ',
    }));
  });

  it('既存のカテゴリ選択に戻ることができる', () => {
    render(
      <TaskForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // 「新しいカテゴリを作成」ボタンをクリック
    const newCategoryButton = screen.getByText('新しいカテゴリを作成');
    fireEvent.click(newCategoryButton);
    
    // 「既存のカテゴリから選択」ボタンをクリック
    const existingCategoryButton = screen.getByText('既存のカテゴリから選択');
    fireEvent.click(existingCategoryButton);
    
    // カテゴリ選択が表示されることを確認
    const categorySelect = screen.getByLabelText(/カテゴリ/);
    expect(categorySelect).toBeInTheDocument();
    
    // カテゴリを選択
    fireEvent.change(categorySelect, { target: { value: '買い物' } });
    
    // タイトルを入力
    const titleInput = screen.getByLabelText(/タイトル/);
    fireEvent.change(titleInput, { target: { value: '新しいタスク' } });
    
    // フォームを送信
    const saveButton = screen.getByText('作成');
    fireEvent.click(saveButton);
    
    // onSaveが正しいデータで呼ばれることを確認
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: '新しいタスク',
      category: '買い物',
    }));
  });
});
