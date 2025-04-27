import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateGroup from './DateGroup';
import { mockTasks } from '../../tests/mocks/taskMocks';
import { formatDate } from '../../utils/dateUtils';

describe('DateGroup', () => {
  const mockDate = new Date('2025-04-01');
  const mockOnToggleComplete = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnEditMemo = vi.fn();
  
  const completedTask = mockTasks.find(task => task.completed);
  const tasks = [completedTask!];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('日付グループを正しくレンダリングする', () => {
    render(
      <DateGroup
        date={mockDate}
        tasks={tasks}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    // 日付ヘッダーが正しく表示されていることを確認
    const formattedDate = formatDate(mockDate);
    expect(screen.getByText(`完了日: ${formattedDate}`)).toBeInTheDocument();
    
    // タスク数が表示されていることを確認
    expect(screen.getByText(`${tasks.length}件`)).toBeInTheDocument();
    
    // タスクが表示されていることを確認
    expect(screen.getByText(completedTask!.title)).toBeInTheDocument();
  });
  
  it('展開/折りたたみが機能する', () => {
    render(
      <DateGroup
        date={mockDate}
        tasks={tasks}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    // 初期状態では展開されている
    expect(screen.getByText(completedTask!.title)).toBeInTheDocument();
    
    // ヘッダーをクリックして折りたたむ
    fireEvent.click(screen.getByText(`完了日: ${formatDate(mockDate)}`));
    
    // タスクが非表示になっていることを確認
    expect(screen.queryByText(completedTask!.title)).not.toBeInTheDocument();
    
    // 再度クリックして展開
    fireEvent.click(screen.getByText(`完了日: ${formatDate(mockDate)}`));
    
    // タスクが再表示されていることを確認
    expect(screen.getByText(completedTask!.title)).toBeInTheDocument();
  });
  
  it('キーボード操作で展開/折りたたみができる', () => {
    render(
      <DateGroup
        date={mockDate}
        tasks={tasks}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onEditMemo={mockOnEditMemo}
      />
    );
    
    const header = screen.getByText(`完了日: ${formatDate(mockDate)}`);
    
    // Enterキーで折りたたむ
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(screen.queryByText(completedTask!.title)).not.toBeInTheDocument();
    
    // Enterキーで展開
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(screen.getByText(completedTask!.title)).toBeInTheDocument();
    
    // スペースキーで折りたたむ
    fireEvent.keyDown(header, { key: ' ' });
    expect(screen.queryByText(completedTask!.title)).not.toBeInTheDocument();
  });
});
