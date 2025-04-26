import type React from 'react';
import { memo, useCallback } from 'react';
import { Task, Priority } from '../../types';
import Button from '../ui/Button';
import TagBadge from '../tags/TagBadge';
import './ActiveTaskList.css';

interface ActiveTaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onViewDetails: (id: string) => void;
  onTagClick: (tag: string) => void;
  onClearFilters: () => void;
  allTasksCount: number;
}

/**
 * アクティブなタスク（未完了タスク）のリストを表示するコンポーネント
 */
const ActiveTaskList: React.FC<ActiveTaskListProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onViewDetails,
  onTagClick,
  onClearFilters,
  allTasksCount
}) => {
  const handleToggleComplete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(id);
  }, [onToggleComplete]);

  const handleEdit = useCallback((task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  }, [onEdit]);

  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  }, [onDelete]);

  const handleViewDetails = useCallback((id: string) => {
    onViewDetails(id);
  }, [onViewDetails]);

  const handleTagClick = useCallback((tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTagClick(tag);
  }, [onTagClick]);

  // アクティブなタスク（未完了タスク）のみをフィルタリング
  const activeTasks = tasks.filter(task => !task.completed);

  return (
    <div className="task-list-section">
      <h2 className="section-title">アクティブなタスク ({activeTasks.length})</h2>
      <div className="task-list">
        {activeTasks.length === 0 ? (
          <div className="empty-state">
            {allTasksCount === 0 ? (
              <>
                <p>タスクはありません</p>
                <p>新しいタスクを追加してください</p>
              </>
            ) : (
              <>
                <p>条件に一致するアクティブなタスクはありません</p>
                <Button 
                  variant="text" 
                  onClick={onClearFilters}
                  type="button"
                >
                  フィルターをクリア
                </Button>
              </>
            )}
          </div>
        ) : (
          <ul className="task-items">
            {activeTasks.map((task) => (
              <li
                key={task.id}
                className="task-item"
                data-testid={`task-item-${task.id}`}
              >
                <div 
                  className="task-item-content"
                  onClick={() => handleViewDetails(task.id)}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onClick={(e) => handleToggleComplete(task.id, e)}
                    onChange={() => {}} // React警告を避けるためのダミーハンドラー
                    className="task-checkbox"
                    aria-label={`${task.title}を${task.completed ? '未完了' : '完了'}としてマーク`}
                  />
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
                            onClick={(e) => handleTagClick(tag, e)}
                          />
                        ))}
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
                    onClick={(e) => handleEdit(task, e)}
                    type="button"
                    aria-label={`${task.title}を編集`}
                  >
                    編集
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleViewDetails(task.id)}
                    type="button"
                    aria-label={`${task.title}の詳細を表示`}
                  >
                    詳細
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={(e) => handleDelete(task.id, e)}
                    type="button"
                    aria-label={`${task.title}を削除`}
                  >
                    削除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// メモ化してパフォーマンスを最適化
export default memo(ActiveTaskList);
