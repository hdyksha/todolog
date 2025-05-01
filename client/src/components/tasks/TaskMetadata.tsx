import type React from 'react';
import { Priority } from '../../types';
import TagBadge from '../tags/TagBadge';
import EditablePriority from './EditablePriority';
import './TaskMetadata.css';

interface TaskMetadataProps {
  isCompleted: boolean;
  priority: Priority;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  onPriorityChange?: (priority: Priority) => Promise<void>;
  editable?: boolean;
}

/**
 * タスクのメタデータ（ステータス、優先度、タグ、期限など）を表示するコンポーネント
 */
const TaskMetadata: React.FC<TaskMetadataProps> = ({
  isCompleted,
  priority,
  tags,
  dueDate,
  createdAt,
  updatedAt,
  onPriorityChange,
  editable = false,
}) => {
  return (
    <div className="task-detail-info">
      <div className="task-detail-status">
        <span className="task-detail-label">ステータス</span>
        <span className={`task-status ${isCompleted ? 'completed' : 'active'}`}>
          {isCompleted ? '完了' : '未完了'}
        </span>
      </div>

      <div className="task-detail-priority">
        <span className="task-detail-label">優先度</span>
        {editable && onPriorityChange ? (
          <EditablePriority 
            priority={priority} 
            onSave={onPriorityChange} 
            disabled={isCompleted} 
          />
        ) : (
          <span className={`task-priority priority-${priority}`}>
            {priority === Priority.High
              ? '高'
              : priority === Priority.Medium
              ? '中'
              : '低'}
          </span>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="task-detail-tags">
          <span className="task-detail-label">タグ</span>
          <div className="task-tags-container">
            {tags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>
      )}

      {dueDate && (
        <div className="task-detail-due-date">
          <span className="task-detail-label">期限</span>
          <span className="task-date">
            {new Date(dueDate).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="task-detail-dates">
        <div>
          <span className="task-detail-label">作成日</span>
          <span className="task-date">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="task-detail-label">更新日</span>
          <span className="task-date">
            {new Date(updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskMetadata;
