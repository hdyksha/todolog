import React, { useState, useEffect } from 'react';
import { useTagContext } from '../../contexts/TagContext';
import { getTagInfo } from '../../utils/tagUtils';
import './TagBadge.css';

interface TagBadgeProps {
  tag: string;
  color?: string;
  onClick?: (e?: React.MouseEvent) => void;
  onRemove?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  isNew?: boolean;
  removable?: boolean;
}

const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  color,
  onClick,
  onRemove,
  size = 'medium',
  className = '',
  isNew = false,
  removable = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { state: { tags: contextTags } } = useTagContext();
  
  // タグの色情報を取得
  // 1. 明示的に指定された色を優先
  // 2. TagContextから取得
  // 3. タグ名からハッシュ値を生成して色を決定
  const tagInfo = color 
    ? { color, textColor: getTagInfo('', { '': { color } }).textColor }
    : getTagInfo(tag, contextTags);
  
  useEffect(() => {
    // マウント時にアニメーションのためにvisibleに設定
    setIsVisible(true);
  }, []);

  const style = {
    backgroundColor: tagInfo.color,
    color: tagInfo.textColor,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(5px)',
  };

  const badgeClasses = [
    'tag-badge',
    `tag-badge-${size}`,
    onClick ? 'tag-badge-clickable' : '',
    isNew ? 'tag-badge-new' : '',
    removable ? 'tag-badge-removable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      className={badgeClasses}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `タグ: ${tag}（クリックで選択）` : `タグ: ${tag}`}
    >
      {tag}
      {removable && (
        <button
          className="tag-badge-remove"
          onClick={handleRemoveClick}
          aria-label={`タグ ${tag} を削除`}
          tabIndex={0}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default TagBadge;
