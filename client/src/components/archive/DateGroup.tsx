import React, { useState } from 'react';
import { Task } from '../../types';
import TaskItem from '../TaskItem';
import { formatDate } from '../../utils/dateUtils';
import './DateGroup.css';

interface DateGroupProps {
  date: Date;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onEditMemo?: (id: string) => void;
}

/**
 * 日付ごとのタスクグループを表示するコンポーネント
 */
const DateGroup: React.FC<DateGroupProps> = ({
  date,
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 日付をフォーマット
  const formattedDate = formatDate(date);
  
  // 完了日のラベルを作成
  const dateLabel = `完了日: ${formattedDate}`;
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  };
  
  const dateString = date.toISOString().split('T')[0];
  const tasksId = `date-tasks-${dateString}`;
  
  return (
    <div className="date-group">
      <div 
        className="date-header"
        onClick={toggleExpand}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={tasksId}
      >
        <span className="date-text">{dateLabel}</span>
        <span className="task-count">{tasks.length}件</span>
        <span 
          className="toggle-button" 
          aria-hidden="true"
        >
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      
      {isExpanded && (
        <div 
          className="date-tasks" 
          id={tasksId}
        >
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className="task-list-item">
                <TaskItem
                  task={task}
                  isArchived={true}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onEditMemo={onEditMemo}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DateGroup;
