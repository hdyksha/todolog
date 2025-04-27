import type React from 'react';
import { useCallback } from 'react';
import { TaskFilters, SortOption } from '../../types';
import FilterPanel from '../filters/FilterPanel';
import TaskSortControl from './TaskSortControl';
import Button from '../ui/Button';
import './TaskFilterBar.css';

interface TaskFilterBarProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableTags: string[];
  tagUsage: Record<string, number>;
}

/**
 * タスクのフィルタリングとソートを行うコンポーネント
 */
const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  sort,
  onSortChange,
  availableTags,
  tagUsage
}) => {
  const handleClearFilters = useCallback(() => {
    onClearFilters();
  }, [onClearFilters]);

  // フィルターが適用されているかどうか
  const hasActiveFilters = filters.completed || 
                          filters.priority || 
                          filters.search || 
                          (filters.tags && filters.tags.length > 0);

  return (
    <div className="task-filter-bar">
      <div className="filter-section">
        <FilterPanel
          filters={filters}
          onFilterChange={onFilterChange}
          availableTags={availableTags}
          tagUsage={tagUsage}
          onClearFilters={handleClearFilters}
        />
      </div>
      
      <div className="filter-controls-row">
        <div className="sort-section">
          <TaskSortControl 
            currentSort={sort} 
            onSortChange={onSortChange} 
          />
        </div>
        
        {hasActiveFilters && (
          <Button 
            variant="text" 
            onClick={handleClearFilters}
            className="clear-filters-button"
            aria-label="フィルターをクリア"
            type="button"
            size="small"
          >
            フィルターをクリア
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskFilterBar;
