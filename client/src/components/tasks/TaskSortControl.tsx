import React from 'react';
import './TaskSortControl.css';

export type SortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

interface TaskSortControlProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const TaskSortControl: React.FC<TaskSortControlProps> = ({
  currentSort,
  onSortChange,
}) => {
  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange({
      field: e.target.value as SortField,
      direction: currentSort.direction,
    });
  };

  const handleDirectionChange = () => {
    onSortChange({
      field: currentSort.field,
      direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="task-sort-control">
      <label className="sort-label">並び替え:</label>
      <div className="sort-controls">
        <select
          className="sort-field-select"
          value={currentSort.field}
          onChange={handleFieldChange}
          aria-label="並び替えフィールド"
        >
          <option value="createdAt">作成日</option>
          <option value="updatedAt">更新日</option>
          <option value="dueDate">期限日</option>
          <option value="priority">優先度</option>
          <option value="title">タイトル</option>
        </select>
        
        <button
          className="sort-direction-button"
          onClick={handleDirectionChange}
          aria-label={`${currentSort.direction === 'asc' ? '昇順' : '降順'}で並び替え`}
        >
          {currentSort.direction === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
};

export default TaskSortControl;
