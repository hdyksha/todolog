import React from 'react';
import { Task, Priority } from '../types';
import Button from './ui/Button';
import TagBadge from './tags/TagBadge';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  isArchived?: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onEditMemo?: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isArchived = false,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  // タスクのクラス名を動的に設定
  const taskClassName = `task-item ${isArchived ? 'task-archived' : ''}`;
  
  const handleTaskClick = () => {
    if (onEditMemo) {
      onEditMemo(task.id);
    }
  };

  return (
    <div className={taskClassName} data-testid="task-item">
      <div 
        className="task-item-content"
        onClick={handleTaskClick}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onClick={(e) => e.stopPropagation()} // クリックイベントの伝播を停止
          onChange={() => onToggleComplete(task.id)}
          className="task-checkbox"
          aria-label={`${task.title}を${task.completed ? '未完了' : '完了'}としてマーク`}
        />
        {isArchived && <span className="check-icon">✓</span>}
        <span className="task-title">{task.title}</span>
        
        <div className="task-meta">
          {task.priority && (
            <span className={`task-priority priority-${task.priority}`}>
              {task.priority === Priority.High
                ? '高'
                : task.priority === Priority.Medium
                ? '中'
                : '低'}
            </span>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.map(tag => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    // タグクリック時の処理（オプション）
                  }}
                />
              ))}
            </div>
          )}
          
          {/* 後方互換性のためにcategoryも表示 */}
          {task.category && !task.tags?.includes(task.category) && (
            <div className="task-category">
              <TagBadge
                tag={task.category}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </div>
          )}
          
          {task.dueDate && (
            <span className="task-due-date">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="task-actions">
        <Button
          variant="text"
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // クリックイベントの伝播を停止
            onEdit(task);
          }}
          aria-label={`${task.title}を編集`}
        >
          編集
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // クリックイベントの伝播を停止
            if (onEditMemo) {
              onEditMemo(task.id);
            }
          }}
        >
          詳細
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // クリックイベントの伝播を停止
            onDelete(task.id);
          }}
          aria-label={`${task.title}を削除`}
        >
          削除
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
