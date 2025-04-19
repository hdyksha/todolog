import React, { ReactNode } from 'react';
import './ResponsiveContainer.css';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}

/**
 * レスポンシブなコンテナコンポーネント
 * 画面サイズに応じて適切な最大幅を設定する
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  padding = true,
}) => {
  const containerClass = `responsive-container responsive-container--${size} ${
    padding ? 'responsive-container--padding' : ''
  } ${className}`;

  return <div className={containerClass}>{children}</div>;
};

export default ResponsiveContainer;
