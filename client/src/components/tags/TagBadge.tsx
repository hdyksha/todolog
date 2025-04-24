import React from 'react';
import './TagBadge.css';

interface TagBadgeProps {
  tag: string;
  color?: string;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// タグ名からハッシュ値を生成し、色を決定する関数
const getColorFromTag = (tag: string): string => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 色相を決定（0-360）
  const hue = hash % 360;
  
  // HSLカラーを返す（彩度と明度は固定）
  return `hsl(${hue}, 70%, 65%)`;
};

const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  color,
  onClick,
  size = 'medium',
  className = '',
}) => {
  const style = {
    backgroundColor: color || getColorFromTag(tag),
  };

  const badgeClasses = [
    'tag-badge',
    `tag-badge-${size}`,
    onClick ? 'tag-badge-clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={badgeClasses}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {tag}
    </span>
  );
};

export default TagBadge;
