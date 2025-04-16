import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArchiveSection from '../../components/ArchiveSection/ArchiveSection';
import { Task } from '../../types/Task';
import TaskList from '../../components/TaskList/TaskList';
import ArchiveHeader from '../../components/ArchiveSection/ArchiveHeader';

// TaskListとArchiveHeaderをモック化
jest.mock('../../components/TaskList/TaskList', () => {
  return jest.fn(({ tasksByDate, isLoading, emptyMessage }) => (
    <div data-testid="task-list-mock">
      {isLoading ? (
        <p>読み込み中...</p>
      ) : Object.keys(tasksByDate).length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        Object.entries(tasksByDate).map(([date, tasks]) => (
          <div key={date} data-testid={`date-group-${date}`}>
            <h3>{date}</h3>
            {tasks.map(task => (
              <div key={task.id} data-testid={`task-${task.id}`}>
                {task.text}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  ));
});

jest.mock('../../components/ArchiveSection/ArchiveHeader', () => {
  return jest.fn(({ count, isOpen, onToggle }) => (
    <div className="archive-header" onClick={onToggle} data-testid="archive-header">
      <h2>アーカイブ済みタスク ({count})</h2>
      <span className={`toggle-icon ${isOpen ? 'open' : 'closed'}`}>
        {isOpen ? '▼' : '▶'}
      </span>
    </div>
  ));
});

describe('ArchiveSection component', () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const mockArchivedTasks: Record<string, Task[]> = {
    [today]: [
      { id: '1', text: '今日のアーカイブタスク', completed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    [yesterday]: [
      { id: '2', text: '昨日のアーカイブタスク1', completed: true, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', text: '昨日のアーカイブタスク2', completed: true, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  };

  const mockOnToggleTask = jest.fn();
  const mockOnDeleteTask = jest.fn();
  const mockOnToggleVisibility = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('アーカイブセクションが表示される', () => {
    render(
      <ArchiveSection
        archivedTasks={mockArchivedTasks}
        showArchived={true}
        isLoading={false}
        onToggleVisibility={mockOnToggleVisibility}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    // ArchiveHeaderが正しく呼び出されていることを確認
    expect(ArchiveHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 3,
        isOpen: true,
      }),
      expect.anything()
    );
  });

  test('アーカイブタスクが表示される', () => {
    render(
      <ArchiveSection
        archivedTasks={mockArchivedTasks}
        showArchived={true}
        isLoading={false}
        onToggleVisibility={mockOnToggleVisibility}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    // TaskListが正しく呼び出されていることを確認
    expect(TaskList).toHaveBeenCalledWith(
      expect.objectContaining({
        tasksByDate: mockArchivedTasks,
        isLoading: false,
        isArchived: true,
      }),
      expect.anything()
    );
  });

  test('アーカイブが空の場合はコンポーネントが表示されない', () => {
    const { container } = render(
      <ArchiveSection
        archivedTasks={{}}
        showArchived={true}
        isLoading={false}
        onToggleVisibility={mockOnToggleVisibility}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('showArchived=falseの場合はTaskListが表示されない', () => {
    render(
      <ArchiveSection
        archivedTasks={mockArchivedTasks}
        showArchived={false}
        isLoading={false}
        onToggleVisibility={mockOnToggleVisibility}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    // ArchiveHeaderは表示される
    expect(ArchiveHeader).toHaveBeenCalled();
    
    // TaskListは呼び出されない
    expect(TaskList).not.toHaveBeenCalled();
  });

  test('ヘッダーをクリックするとonToggleVisibilityが呼ばれる', () => {
    render(
      <ArchiveSection
        archivedTasks={mockArchivedTasks}
        showArchived={true}
        isLoading={false}
        onToggleVisibility={mockOnToggleVisibility}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    // ArchiveHeaderのonToggleが呼ばれると、onToggleVisibilityが呼ばれる
    const mockCall = (ArchiveHeader as jest.Mock).mock.calls[0];
    mockCall[0].onToggle();
    
    expect(mockOnToggleVisibility).toHaveBeenCalled();
  });

  test('ローディング中はTaskListにisLoadingが渡される', () => {
    render(
      <ArchiveSection
        archivedTasks={mockArchivedTasks}
        showArchived={true}
        isLoading={true}
        onToggleVisibility={mockOnToggleVisibility}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(TaskList).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
      expect.anything()
    );
  });
});
