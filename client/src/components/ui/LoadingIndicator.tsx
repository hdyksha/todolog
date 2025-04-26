import type React from 'react';
import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

/**
 * ローディング状態を表示するインジケーターコンポーネント
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  message = '読み込み中...',
  fullScreen = false,
}) => {
  const containerClassName = `loading-container ${fullScreen ? 'loading-fullscreen' : ''}`;
  const spinnerClassName = `loading-spinner spinner-${size}`;

  return (
    <div className={containerClassName} role="status" aria-live="polite">
      <div className={spinnerClassName}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
