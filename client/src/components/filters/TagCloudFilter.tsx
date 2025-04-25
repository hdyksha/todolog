import React from 'react';
import { Tag } from '../../types';
import TagCloud from '../TagCloud';
import './TagCloudFilter.css';

interface TagCloudFilterProps {
  availableTags: Record<string, Tag>;
  tagUsage: Record<string, number>;
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagCloudFilter: React.FC<TagCloudFilterProps> = ({
  availableTags,
  tagUsage,
  selectedTags,
  onTagSelect
}) => {
  // タグをクリックしたときの処理
  const handleTagClick = (tag: string) => {
    onTagSelect(tag);
  };
  
  // 使用されているタグがあるかどうか
  const hasUsedTags = Object.values(tagUsage).some(count => count > 0);
  
  if (!hasUsedTags) {
    return (
      <div className="tag-cloud-filter">
        <p className="no-tags-message">タスクにタグが設定されていません</p>
      </div>
    );
  }
  
  return (
    <div className="tag-cloud-filter">
      <div className="tag-cloud-filter-header">
        <h3>タグクラウド</h3>
        <span className="tag-cloud-hint">
          クリックしてフィルター
        </span>
      </div>
      
      <TagCloud
        tags={availableTags}
        tagUsage={tagUsage}
        onTagClick={handleTagClick}
        selectedTags={selectedTags}
      />
    </div>
  );
};

export default TagCloudFilter;
