import type React from 'react';
import { Priority } from '../../types';
import EditablePriority from './EditablePriority';
import EditableTagList from '../tags/EditableTagList';
import './TaskMetadata.css';

interface TaskMetadataProps {
  isCompleted: boolean;
  priority: Priority;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  onPriorityChange?: (priority: Priority) => Promise<void>;
  onTagsChange?: (tags: string[]) => Promise<void>;
  editable?: boolean;
}

/**
 * タスクのメタデータ（ステータス、優先度、タグ、期限など）を表示するコンポーネント
 */
const TaskMetadata: React.FC<TaskMetadataProps> = ({
  isCompleted,
  priority,
  tags = [],
  dueDate,
  createdAt,
  updatedAt,
  onPriorityChange,
  onTagsChange,
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
          {editable && onTagsChange ? (
            <EditableTagList
              tags={tags}
              onSave={onTagsChange}
              disabled={isCompleted}
            />
          ) : (
            <div className="task-tags-container">
              {tags.map(tag => (
                <span key={tag} className="tag-badge" aria-label={`タグ: ${tag}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
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
