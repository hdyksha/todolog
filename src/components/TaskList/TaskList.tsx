import React from 'react';
import { Task } from '../../types/Task';
import TaskGroup from './TaskGroup';

// 日付ごとにグループ化されたタスクの型
interface TasksByDate {
  [date: string]: Task[];
}

interface TaskListProps {
  tasksByDate: TasksByDate;
  isLoading: boolean;
  isArchived?: boolean;
  emptyMessage?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasksByDate,
  isLoading,
  isArchived = false,
  emptyMessage = 'タスクはありません',
  onToggleTask,
  onDeleteTask,
}) => {
  if (isLoading) {
    return <p className="loading">読み込み中...</p>;
  }

  if (Object.keys(tasksByDate).length === 0) {
    return <p className="no-tasks">{emptyMessage}</p>;
  }

  return (
    <div className={`task-list ${isArchived ? 'archived-tasks' : 'active-tasks'}`}>
      {Object.keys(tasksByDate).map(date => (
        <TaskGroup
          key={date}
          date={date}
          tasks={tasksByDate[date]}
          isArchived={isArchived}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default TaskList;
