import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateGroup from './DateGroup';
import { Task, Priority } from '../../types';

// モックデータ
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'テストタスク1',
    completed: true,
    priority: Priority.Medium,
    createdAt: '2025-04-20T10:00:00.000Z',
    updatedAt: '2025-04-20T15:00:00.000Z',
  },
  {
    id: '2',
    title: 'テストタスク2',
    completed: true,
    priority: Priority.High,
    createdAt: '2025-04-19T10:00:00.000Z',
    updatedAt: '2025-04-20T16:00:00.000Z',
  },
];

// モック関数
const mockToggleComplete = vi.fn();
const mockDelete = vi.fn();
const mockEdit = vi.fn();
const mockEditMemo = vi.fn();

describe('DateGroup', () => {
  it('日付と件数が正しく表示される', () => {
    render(
      <DateGroup
        date={new Date('2025-04-20')}
        tasks={mockTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    // 日付が表示されていることを確認
    expect(screen.getByText(/2025年4月20日/)).toBeInTheDocument();
    
    // タスク数が表示されていることを確認
    expect(screen.getByText('2件')).toBeInTheDocument();
  });

  it('初期状態では展開されている', () => {
    render(
      <DateGroup
        date={new Date('2025-04-20')}
        tasks={mockTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    // タスクが表示されていることを確認
    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    expect(screen.getByText('テストタスク2')).toBeInTheDocument();
  });

  it('ヘッダーをクリックすると折りたたみ/展開が切り替わる', () => {
    render(
      <DateGroup
        date={new Date('2025-04-20')}
        tasks={mockTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    // 初期状態ではタスクが表示されている
    expect(screen.getByText('テストタスク1')).toBeInTheDocument();

    // ヘッダーをクリック
    fireEvent.click(screen.getByText(/2025年4月20日/));

    // タスクが非表示になっていることを確認
    expect(screen.queryByText('テストタスク1')).not.toBeInTheDocument();

    // もう一度ヘッダーをクリック
    fireEvent.click(screen.getByText(/2025年4月20日/));

    // タスクが再表示されていることを確認
    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
  });
});
