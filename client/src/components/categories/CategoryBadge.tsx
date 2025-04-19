import React from 'react';
import './CategoryBadge.css';

interface CategoryBadgeProps {
  category: string;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// カテゴリ名からハッシュ値を生成し、色を決定する関数
const getColorFromCategory = (category: string): string => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 色相を決定（0-360）
  const hue = hash % 360;
  
  // HSLカラーを返す（彩度と明度は固定）
  return `hsl(${hue}, 70%, 65%)`;
};

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  onClick,
  size = 'medium',
  className = '',
}) => {
  const style = {
    backgroundColor: getColorFromCategory(category),
  };

  const badgeClasses = [
    'category-badge',
    `category-badge-${size}`,
    onClick ? 'category-badge-clickable' : '',
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
      {category}
    </span>
  );
};

export default CategoryBadge;
