import React from 'react';
import { Task } from '../../types/Task';
import TaskItem from './TaskItem';

interface TaskGroupProps {
  date: string;
  tasks: Task[];
  isArchived?: boolean;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskGroup: React.FC<TaskGroupProps> = ({
  date,
  tasks,
  isArchived = false,
  onToggleTask,
  onDeleteTask
}) => {
  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 日付を YYYY-MM-DD 形式に変換
    const dateToday = today.toISOString().split('T')[0];
    const dateYesterday = yesterday.toISOString().split('T')[0];
    const dateTask = dateString;
    
    if (dateTask === dateToday) {
      return '今日';
    } else if (dateTask === dateYesterday) {
      return '昨日';
    } else {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    }
  };

  return (
    <div className={`task-group ${isArchived ? 'archived' : ''}`}>
      <h3 className={`date-header ${isArchived ? 'archived' : ''}`}>
        {formatDate(date)}
      </h3>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          isArchived={isArchived}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default TaskGroup;
