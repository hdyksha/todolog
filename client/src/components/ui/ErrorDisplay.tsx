import type React from 'react';
import Button from './Button';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * エラーメッセージを表示するコンポーネント
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'エラーが発生しました',
  message,
  onRetry,
  retryLabel = '再試行',
}) => {
  return (
    <div className="error-container" role="alert">
      <div className="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
        </svg>
      </div>
      <h2 className="error-title">{title}</h2>
      <p className="error-message">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="primary"
          type="button"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorDisplay;
