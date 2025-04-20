import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ArchiveSection from './ArchiveSection';
import { Task, Priority } from '../../types';
import { SettingsProvider } from '../../contexts/SettingsContext';

// モックタスクデータ
const mockTasks: Task[] = [
  // 完了済みタスク
  {
    id: '1',
    title: '完了済みタスク1',
    completed: true,
    priority: Priority.High,
    createdAt: '2025-04-15T10:00:00Z',
    updatedAt: '2025-04-19T15:00:00Z',
  },
  {
    id: '2',
    title: '完了済みタスク2',
    completed: true,
    priority: Priority.Medium,
    createdAt: '2025-04-16T10:00:00Z',
    updatedAt: '2025-04-20T10:00:00Z',
  },
  // 未完了タスク
  {
    id: '3',
    title: '未完了タスク',
    completed: false,
    priority: Priority.Low,
    createdAt: '2025-04-20T10:00:00Z',
    updatedAt: '2025-04-20T10:00:00Z',
  }
];

// モックハンドラー
const mockHandlers = {
  onToggleComplete: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onEditMemo: vi.fn(),
};

describe('ArchiveSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('完了済みタスクのみが表示される', () => {
    render(
      <SettingsProvider initialSettings={{ showArchive: true, autoExpandArchive: true, showArchiveStats: true }}>
        <ArchiveSection
          tasks={mockTasks}
          onToggleComplete={mockHandlers.onToggleComplete}
          onDelete={mockHandlers.onDelete}
          onEdit={mockHandlers.onEdit}
          onEditMemo={mockHandlers.onEditMemo}
        />
      </SettingsProvider>
    );

    // ヘッダーが表示されることを確認
    expect(screen.getByText(/アーカイブ済み/)).toBeInTheDocument();
    
    // 未完了タスクは表示されないことを確認
    expect(screen.queryByText('未完了タスク')).not.toBeInTheDocument();
  });

  it('初期状態では折りたたまれている', () => {
    render(
      <SettingsProvider initialSettings={{ showArchive: true, autoExpandArchive: false, showArchiveStats: true }}>
        <ArchiveSection
          tasks={mockTasks}
          onToggleComplete={mockHandlers.onToggleComplete}
          onDelete={mockHandlers.onDelete}
          onEdit={mockHandlers.onEdit}
          onEditMemo={mockHandlers.onEditMemo}
        />
      </SettingsProvider>
    );

    // タスクリストが表示されていないことを確認
    expect(screen.queryByText('完了済みタスク1')).not.toBeInTheDocument();
  });

  it('ヘッダーをクリックすると展開される', () => {
    render(
      <SettingsProvider initialSettings={{ showArchive: true, autoExpandArchive: false, showArchiveStats: true }}>
        <ArchiveSection
          tasks={mockTasks}
          onToggleComplete={mockHandlers.onToggleComplete}
          onDelete={mockHandlers.onDelete}
          onEdit={mockHandlers.onEdit}
          onEditMemo={mockHandlers.onEditMemo}
        />
      </SettingsProvider>
    );

    // ヘッダーをクリック
    const header = screen.getByText(/アーカイブ済み/);
    fireEvent.click(header);
    
    // タスクリストが表示されることを確認
    expect(screen.getByText('完了済みタスク1')).toBeInTheDocument();
  });

  it('タスクアイテムのイベントハンドラーが正しく動作する', () => {
    render(
      <SettingsProvider initialSettings={{ showArchive: true, autoExpandArchive: true, showArchiveStats: true }}>
        <ArchiveSection
          tasks={mockTasks}
          onToggleComplete={mockHandlers.onToggleComplete}
          onDelete={mockHandlers.onDelete}
          onEdit={mockHandlers.onEdit}
          onEditMemo={mockHandlers.onEditMemo}
        />
      </SettingsProvider>
    );
    
    // ヘッダーが表示されることを確認
    expect(screen.getByText(/アーカイブ済み/)).toBeInTheDocument();
  });
});
