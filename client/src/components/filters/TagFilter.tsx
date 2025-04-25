import React, { useState } from 'react';
import { Tag } from '../../types';
import TagBadge from '../tags/TagBadge';
import './TagFilter.css';

interface TagFilterProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags: Record<string, Tag>;
  filterMode?: 'any' | 'all';
  onFilterModeChange?: (mode: 'any' | 'all') => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  selectedTags, 
  onChange, 
  availableTags,
  filterMode = 'any',
  onFilterModeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // タグの選択/選択解除を切り替える
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };
  
  // すべてのタグの選択を解除
  const clearTags = () => {
    onChange([]);
  };
  
  // タグの検索フィルタリング
  const filteredTags = Object.entries(availableTags)
    .filter(([tagName]) => 
      searchTerm === '' || tagName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a[0].localeCompare(b[0])); // アルファベット順
  
  return (
    <div className="tag-filter">
      <div className="tag-filter-header">
        <h3>タグでフィルター</h3>
        {selectedTags.length > 0 && (
          <button
            type="button"
            className="clear-tags-button"
            onClick={clearTags}
            aria-label="タグフィルターをクリア"
          >
            クリア
          </button>
        )}
      </div>
      
      {selectedTags.length > 1 && onFilterModeChange && (
        <div className="tag-filter-mode">
          <label>
            <input
              type="radio"
              name="filterMode"
              checked={filterMode === 'any'}
              onChange={() => onFilterModeChange('any')}
            />
            いずれかのタグを含む
          </label>
          <label>
            <input
              type="radio"
              name="filterMode"
              checked={filterMode === 'all'}
              onChange={() => onFilterModeChange('all')}
            />
            すべてのタグを含む
          </label>
        </div>
      )}
      
      <div className="tag-search">
        <input
          type="text"
          placeholder="タグを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="tag-search-input"
          aria-label="タグを検索"
        />
      </div>
      
      <div className="tag-filter-list">
        {filteredTags.length === 0 ? (
          <p className="no-tags-message">
            {searchTerm ? 'タグが見つかりません' : 'タグがありません'}
          </p>
        ) : (
          <div className="tag-cloud">
            {filteredTags.map(([tagName, tagInfo]) => (
              <div
                key={tagName}
                className={`tag-filter-item ${selectedTags.includes(tagName) ? 'selected' : ''}`}
                onClick={() => toggleTag(tagName)}
              >
                <TagBadge
                  tag={tagName}
                  color={tagInfo.color}
                  size="medium"
                />
                {selectedTags.includes(tagName) && (
                  <span className="tag-selected-indicator">✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagFilter;
