import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../../components/TaskList/TaskList';
import { Task } from '../../types/Task';
import TaskGroup from '../../components/TaskList/TaskGroup';

// TaskGroupをモック化
jest.mock('../../components/TaskList/TaskGroup', () => {
  return jest.fn(({ date, tasks, onToggleTask, onDeleteTask }) => (
    <div data-testid={`task-group-${date}`}>
      <h3>{date}</h3>
      {tasks.map(task => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          {task.text}
        </div>
      ))}
    </div>
  ));
});

describe('TaskList component', () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const mockTasks: Record<string, Task[]> = {
    [today]: [
      { id: '1', text: '今日のタスク1', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', text: '今日のタスク2', completed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    [yesterday]: [
      { id: '3', text: '昨日のタスク', completed: false, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  };

  const mockOnToggleTask = jest.fn();
  const mockOnDeleteTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('タスクが日付ごとにグループ化されて表示される', () => {
    render(
      <TaskList
        tasksByDate={mockTasks}
        isLoading={false}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    // TaskGroupが各日付で呼び出されていることを確認
    expect(TaskGroup).toHaveBeenCalledTimes(2);
    expect(TaskGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        date: today,
        tasks: mockTasks[today],
      }),
      expect.anything()
    );
    expect(TaskGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        date: yesterday,
        tasks: mockTasks[yesterday],
      }),
      expect.anything()
    );
  });

  test('タスクが空の場合はemptyMessageが表示される', () => {
    render(
      <TaskList
        tasksByDate={{}}
        isLoading={false}
        emptyMessage="タスクはありません"
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('タスクはありません')).toBeInTheDocument();
  });

  test('ローディング中はローディングメッセージが表示される', () => {
    render(
      <TaskList
        tasksByDate={mockTasks}
        isLoading={true}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('アーカイブフラグが正しく設定される', () => {
    const { container } = render(
      <TaskList
        tasksByDate={mockTasks}
        isLoading={false}
        isArchived={true}
        onToggleTask={mockOnToggleTask}
        onDeleteTask={mockOnDeleteTask}
      />
    );

    // TaskGroupにisArchivedが渡されていることを確認
    expect(TaskGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        isArchived: true,
      }),
      expect.anything()
    );

    // クラス名が正しく設定されていることを確認
    const taskList = container.querySelector('.task-list');
    expect(taskList).toHaveClass('archived-tasks');
    expect(taskList).not.toHaveClass('active-tasks');
  });
});
