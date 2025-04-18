import React, { useState } from 'react';
import { Task, Priority } from '../types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onEditMemo?: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  const [expanded, setExpanded] = useState(false);

  // 優先度に応じたクラス名を取得
  const getPriorityClass = (priority: Priority) => {
    switch (priority) {
      case Priority.High:
        return 'priority-high';
      case Priority.Medium:
        return 'priority-medium';
      case Priority.Low:
        return 'priority-low';
      default:
        return '';
    }
  };

  // 優先度の表示テキストを取得
  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.High:
        return '高';
      case Priority.Medium:
        return '中';
      case Priority.Low:
        return '低';
      default:
        return '';
    }
  };

  // 日付のフォーマット
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <div className="task-checkbox">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            id={`task-${task.id}`}
          />
          <label htmlFor={`task-${task.id}`} className="checkbox-label"></label>
        </div>

        <div className="task-title" onClick={() => setExpanded(!expanded)}>
          <h3>{task.title}</h3>
        </div>

        <div className="task-meta">
          <span className={`task-priority ${getPriorityClass(task.priority)}`}>
            {getPriorityText(task.priority)}
          </span>
          {task.category && <span className="task-category">{task.category}</span>}
          {task.dueDate && (
            <span className="task-due-date">
              期限: {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        <div className="task-actions">
          <button
            className="task-action-button"
            onClick={() => onEdit(task.id)}
            aria-label="タスクを編集"
          >
            ✏️
          </button>
          <button
            className="task-action-button"
            onClick={() => onDelete(task.id)}
            aria-label="タスクを削除"
          >
            🗑️
          </button>
          <button
            className="task-action-button"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "詳細を閉じる" : "詳細を表示"}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="task-details">
          {task.memo ? (
            <div className="task-memo">
              <h4>メモ</h4>
              <p>{task.memo}</p>
              {onEditMemo && (
                <button
                  className="edit-memo-button"
                  onClick={() => onEditMemo(task.id)}
                >
                  メモを編集
                </button>
              )}
            </div>
          ) : onEditMemo ? (
            <div className="task-memo empty">
              <p>メモはありません</p>
              <button
                className="add-memo-button"
                onClick={() => onEditMemo(task.id)}
              >
                メモを追加
              </button>
            </div>
          ) : null}
          <div className="task-dates">
            <p>作成日: {formatDate(task.createdAt)}</p>
            <p>更新日: {formatDate(task.updatedAt)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
