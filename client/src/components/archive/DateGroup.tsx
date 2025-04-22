import React, { useState } from 'react';
import { Task } from '../../types';
import TaskItem from '../TaskItem';
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
  
  // 日付を「YYYY年MM月DD日（曜日）」形式でフォーマット
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    
    return `${year}年${month}月${day}日（${dayOfWeek}）`;
  };
  
  const formattedDate = formatDate(date);
  
  return (
    <div className="date-group">
      <div 
        className="date-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="date-text">{formattedDate}</span>
        <span className="task-count">{tasks.length}件</span>
        <button className="toggle-button" aria-label={isExpanded ? '折りたたむ' : '展開する'}>
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="date-tasks">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isArchived={true}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onEditMemo={onEditMemo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DateGroup;
