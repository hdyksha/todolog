import React from 'react';
import { Tag } from '../../types';
import TagBadge from '../tags/TagBadge';
import './TagFilter.css';

interface TagFilterProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags: Record<string, Tag>;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  selectedTags, 
  onChange, 
  availableTags 
}) => {
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
  
  // タグの使用頻度に基づいてソート（将来的に実装）
  const sortedTags = Object.entries(availableTags).sort((a, b) => {
    return a[0].localeCompare(b[0]); // アルファベット順
  });
  
  return (
    <div className="tag-filter">
      <div className="tag-filter-header">
        <h3>タグでフィルター</h3>
        {selectedTags.length > 0 && (
          <button
            type="button"
            className="clear-tags-button"
            onClick={clearTags}
          >
            クリア
          </button>
        )}
      </div>
      
      <div className="tag-filter-list">
        {sortedTags.length === 0 ? (
          <p className="no-tags-message">タグがありません</p>
        ) : (
          <div className="tag-cloud">
            {sortedTags.map(([tagName, tagInfo]) => (
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
