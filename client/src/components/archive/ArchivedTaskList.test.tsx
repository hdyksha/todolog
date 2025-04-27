import React from 'react';
import { render, screen } from '@testing-library/react';
import ArchivedTaskList from './ArchivedTaskList';
import { mockTasks } from '../../tests/mocks/taskMocks';
import * as dateUtils from '../../utils/dateUtils';

// dateUtilsのモック
vi.mock('../../utils/dateUtils', async () => {
  const actual = await vi.importActual('../../utils/dateUtils');
  return {
    ...actual,
    groupTasksByDate: vi.fn().mockImplementation((tasks) => {
      return {
        '2025-04-01': tasks.filter(task => task.completed),
      };
    }),
    formatDate: vi.fn().mockReturnValue('2025年4月1日（火）'),
  };
});

describe('ArchivedTaskList', () => {
  const mockOnToggleComplete = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnEditMemo = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('完了済みタスクを日付ごとにグループ化して表示する', () => {
    render(
      <ArchivedTaskList
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    // groupTasksByDateが呼ばれていることを確認
    expect(dateUtils.groupTasksByDate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ completed: true })
      ])
    );
    
    // 完了済みタスクが表示されていることを確認
    const completedTask = mockTasks.find(task => task.completed);
    expect(screen.getByText(completedTask!.title)).toBeInTheDocument();
    
    // 未完了タスクは表示されていないことを確認
    const incompleteTasks = mockTasks.filter(task => !task.completed);
    incompleteTasks.forEach(task => {
      expect(screen.queryByText(task.title)).not.toBeInTheDocument();
    });
  });
  
  it('完了済みタスクがない場合はメッセージを表示する', () => {
    render(
      <ArchivedTaskList
        tasks={mockTasks.filter(task => !task.completed)}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    expect(screen.getByText('アーカイブされたタスクはありません')).toBeInTheDocument();
  });
  
  it('アクセシビリティ属性が正しく設定されている', () => {
    render(
      <ArchivedTaskList
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    // アーカイブリストのリージョンロールとラベルを確認
    const archiveList = screen.getByRole('region', { name: 'アーカイブされたタスク一覧' });
    expect(archiveList).toBeInTheDocument();
  });
});
