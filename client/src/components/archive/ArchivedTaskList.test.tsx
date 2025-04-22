import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArchivedTaskList from './ArchivedTaskList';
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
    updatedAt: '2025-04-19T16:00:00.000Z',
  },
  {
    id: '3',
    title: '未完了タスク',
    completed: false,
    priority: Priority.Low,
    createdAt: '2025-04-18T10:00:00.000Z',
    updatedAt: '2025-04-18T12:00:00.000Z',
  },
];

// モック関数
const mockToggleComplete = vi.fn();
const mockDelete = vi.fn();
const mockEdit = vi.fn();
const mockEditMemo = vi.fn();

describe('ArchivedTaskList', () => {
  it('完了済みタスクのみが表示される', () => {
    render(
      <ArchivedTaskList
        tasks={mockTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    // 完了済みタスクが表示されていることを確認
    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    expect(screen.getByText('テストタスク2')).toBeInTheDocument();
    
    // 未完了タスクは表示されていないことを確認
    expect(screen.queryByText('未完了タスク')).not.toBeInTheDocument();
  });

  it('日付ごとにグループ化されている', () => {
    render(
      <ArchivedTaskList
        tasks={mockTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    // 日付グループが表示されていることを確認
    expect(screen.getByText(/2025年4月20日/)).toBeInTheDocument();
    expect(screen.getByText(/2025年4月19日/)).toBeInTheDocument();
    
    // 各日付グループのタスク数が表示されていることを確認
    // 複数の「1件」が存在するため、getAllByTextを使用
    const taskCountElements = screen.getAllByText('1件');
    expect(taskCountElements.length).toBe(2);
  });

  it('アーカイブされたタスクがない場合はメッセージが表示される', () => {
    const emptyTasks: Task[] = [
      {
        id: '3',
        title: '未完了タスク',
        completed: false,
        priority: Priority.Low,
        createdAt: '2025-04-18T10:00:00.000Z',
        updatedAt: '2025-04-18T12:00:00.000Z',
      },
    ];

    render(
      <ArchivedTaskList
        tasks={emptyTasks}
        onToggleComplete={mockToggleComplete}
        onDelete={mockDelete}
        onEdit={mockEdit}
        onEditMemo={mockEditMemo}
      />
    );

    // メッセージが表示されていることを確認
    expect(screen.getByText('アーカイブされたタスクはありません')).toBeInTheDocument();
  });
});
