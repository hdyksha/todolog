import React, { useState } from 'react';
import { Priority, Tag } from '../../types';
import Button from '../ui/Button';
import TagFilter from './TagFilter';
import './FilterPanel.css';

export interface FilterOptions {
  priority: Priority | 'all';
  tags?: string[];
  searchTerm: string;
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableTags: Record<string, Tag>;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  availableTags,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePriorityChange = (priority: Priority | 'all') => {
    onFilterChange({ ...filters, priority });
  };

  const handleTagsChange = (tags: string[]) => {
    onFilterChange({ ...filters, tags });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchTerm: e.target.value });
  };

  // クイックフィルターが適用されているかどうか
  const hasActiveFilters =
    filters.priority !== 'all' ||
    (filters.tags && filters.tags.length > 0) ||
    filters.searchTerm !== '';

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-quick-actions">
          <div className="filter-search">
            <input
              type="text"
              placeholder="タスクを検索..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="filter-search-input"
              aria-label="タスクを検索"
            />
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="text"
              size="small"
              onClick={onClearFilters}
            >
              フィルターをクリア
            </Button>
          )}
        </div>
        
        <Button
          variant="text"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-panel-expanded"
        >
          {isExpanded ? '詳細フィルターを隠す' : '詳細フィルターを表示'}
        </Button>
      </div>
      
      {isExpanded && (
        <div id="filter-panel-expanded" className="filter-panel-expanded">
          <div className="filter-section">
            <h3 className="filter-section-title">優先度</h3>
            <div className="filter-priority-buttons">
              <button
                className={`filter-button ${filters.priority === 'all' ? 'active' : ''}`}
                onClick={() => handlePriorityChange('all')}
              >
                すべて
              </button>
              <button
                className={`filter-button priority-high ${filters.priority === Priority.High ? 'active' : ''}`}
                onClick={() => handlePriorityChange(Priority.High)}
              >
                高
              </button>
              <button
                className={`filter-button priority-medium ${filters.priority === Priority.Medium ? 'active' : ''}`}
                onClick={() => handlePriorityChange(Priority.Medium)}
              >
                中
              </button>
              <button
                className={`filter-button priority-low ${filters.priority === Priority.Low ? 'active' : ''}`}
                onClick={() => handlePriorityChange(Priority.Low)}
              >
                低
              </button>
            </div>
          </div>
          
          {Object.keys(availableTags).length > 0 && (
            <div className="filter-section">
              <TagFilter
                selectedTags={filters.tags || []}
                onChange={handleTagsChange}
                availableTags={availableTags}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
