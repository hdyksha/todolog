import React from 'react';
import { Task } from '../../types/Task';

interface TaskItemProps {
  task: Task;
  isArchived?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isArchived = false,
  onToggle,
  onDelete
}) => {
  // 時刻のフォーマット
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`task-item ${isArchived ? 'archived' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <span className="task-text">{task.text}</span>
      <span className="task-time">{formatTime(task.createdAt)}</span>
      <button onClick={() => onDelete(task.id)} className="delete-btn">
        削除
      </button>
    </div>
  );
};

export default React.memo(TaskItem);
