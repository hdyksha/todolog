import React, { useMemo } from 'react';
import { Tag } from '../types';
import TagBadge from './tags/TagBadge';
import './TagCloud.css';

interface TagCloudProps {
  tags: Record<string, Tag>;
  tagUsage?: Record<string, number>;
  onTagClick?: (tag: string) => void;
  selectedTags?: string[];
  maxTags?: number;
}

const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  tagUsage,
  onTagClick,
  selectedTags = [],
  maxTags = 30
}) => {
  // タグの使用頻度に基づいてサイズを計算
  const getTagSize = (tag: string): 'small' | 'medium' | 'large' => {
    if (!tagUsage) return 'medium';
    
    const usage = tagUsage[tag] || 0;
    const maxUsage = Math.max(...Object.values(tagUsage));
    
    if (maxUsage <= 1) return 'medium';
    
    const ratio = usage / maxUsage;
    if (ratio < 0.3) return 'small';
    if (ratio > 0.7) return 'large';
    return 'medium';
  };
  
  // タグを使用頻度でソート
  const sortedTags = useMemo(() => {
    return Object.entries(tags)
      .sort((a, b) => {
        // 使用頻度でソート（降順）
        if (tagUsage) {
          const usageA = tagUsage[a[0]] || 0;
          const usageB = tagUsage[b[0]] || 0;
          if (usageA !== usageB) {
            return usageB - usageA;
          }
        }
        // 同じ使用頻度ならアルファベット順
        return a[0].localeCompare(b[0]);
      })
      .slice(0, maxTags); // 最大表示数を制限
  }, [tags, tagUsage, maxTags]);
  
  if (Object.keys(tags).length === 0) {
    return <p className="no-tags-message">タグがありません</p>;
  }
  
  return (
    <div className="tag-cloud-container">
      {sortedTags.map(([tagName, tagInfo]) => (
        <div
          key={tagName}
          className={`tag-cloud-item ${selectedTags.includes(tagName) ? 'selected' : ''}`}
          onClick={() => onTagClick && onTagClick(tagName)}
        >
          <TagBadge
            tag={tagName}
            color={tagInfo.color}
            size={getTagSize(tagName)}
            onClick={onTagClick ? () => onTagClick(tagName) : undefined}
          />
          {tagUsage && tagUsage[tagName] > 0 && (
            <span className="tag-usage-count">{tagUsage[tagName]}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default TagCloud;
