import type React from 'react';
import './TaskActions.css';

interface TaskActionsProps {
  taskId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({
  taskId,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  return (
    <div className="task-actions">
      <button
        className="task-action-button edit"
        onClick={() => onEdit(taskId)}
        aria-label="タスクを編集"
        type="button"
      >
        編集
      </button>
      <button
        className="task-action-button delete"
        onClick={() => onDelete(taskId)}
        aria-label="タスクを削除"
        type="button"
      >
        削除
      </button>
      <button
        className="task-action-button toggle"
        onClick={() => onToggleComplete(taskId)}
        aria-label="完了状態を切り替え"
        type="button"
      >
        完了切替
      </button>
    </div>
  );
};

export default TaskActions;
