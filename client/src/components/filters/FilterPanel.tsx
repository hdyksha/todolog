import React, { useState } from 'react';
import { Priority } from '../../types';
import Button from '../ui/Button';
import './FilterPanel.css';

export interface FilterOptions {
  status: 'all' | 'active' | 'completed';
  priority: Priority | 'all';
  category: string | null;
  searchTerm: string;
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  categories,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (status: 'all' | 'active' | 'completed') => {
    onFilterChange({ ...filters, status });
  };

  const handlePriorityChange = (priority: Priority | 'all') => {
    onFilterChange({ ...filters, priority });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value === 'all' ? null : e.target.value;
    onFilterChange({ ...filters, category });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchTerm: e.target.value });
  };

  // クイックフィルターが適用されているかどうか
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== null ||
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
            />
          </div>
          
          <div className="filter-status-buttons">
            <button
              className={`filter-button ${filters.status === 'all' ? 'active' : ''}`}
              onClick={() => handleStatusChange('all')}
            >
              すべて
            </button>
            <button
              className={`filter-button ${filters.status === 'active' ? 'active' : ''}`}
              onClick={() => handleStatusChange('active')}
            >
              未完了
            </button>
            <button
              className={`filter-button ${filters.status === 'completed' ? 'active' : ''}`}
              onClick={() => handleStatusChange('completed')}
            >
              完了済
            </button>
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
        >
          {isExpanded ? '詳細フィルターを隠す' : '詳細フィルターを表示'}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="filter-panel-expanded">
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
          
          {categories.length > 0 && (
            <div className="filter-section">
              <h3 className="filter-section-title">カテゴリ</h3>
              <select
                className="filter-category-select"
                value={filters.category || 'all'}
                onChange={handleCategoryChange}
              >
                <option value="all">すべてのカテゴリ</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
