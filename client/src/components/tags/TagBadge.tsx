import React, { useState, useEffect } from 'react';
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

// コントラスト比を計算して、白または黒のテキスト色を決定する
const getTextColor = (backgroundColor: string): string => {
  // HSLから明度を抽出
  const match = backgroundColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
  if (match && match[1]) {
    const lightness = parseInt(match[1], 10);
    // 明度が50%以上なら黒、それ以下なら白
    return lightness >= 50 ? '#000' : '#fff';
  }
  
  // HEXカラーの場合
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.substring(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 明度の計算（YIQ式）
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  }
  
  return '#fff'; // デフォルトは白
};

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
  const backgroundColor = color || getColorFromTag(tag);
  const textColor = getTextColor(backgroundColor);
  
  useEffect(() => {
    // マウント時にアニメーションのためにvisibleに設定
    setIsVisible(true);
  }, []);

  const style = {
    backgroundColor,
    color: textColor,
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
