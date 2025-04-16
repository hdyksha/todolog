import React from 'react';
import { useErrorContext } from '../../contexts/ErrorContext';
import { ErrorType, isRetryableError } from '../../hooks/useErrorHandler';
import './ErrorDisplay.css';

const ErrorDisplay: React.FC = () => {
  const { error, isRetrying, clearError, retryOperation } = useErrorContext();

  if (!error) return null;

  // エラータイプに応じたアイコンを取得
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return '🌐';
      case ErrorType.SERVER:
        return '🖥️';
      case ErrorType.VALIDATION:
        return '⚠️';
      case ErrorType.NOT_FOUND:
        return '🔍';
      case ErrorType.PERMISSION:
        return '🔒';
      default:
        return '❌';
    }
  };

  // エラータイプに応じたクラス名を取得
  const getErrorClassName = () => {
    return `error-message error-${error.type}`;
  };

  return (
    <div className={getErrorClassName()} role="alert">
      <div className="error-header">
        <span className="error-icon">{getErrorIcon()}</span>
        <span className="error-title">{error.message}</span>
        <button className="error-close" onClick={clearError} aria-label="エラーメッセージを閉じる">
          ×
        </button>
      </div>

      {error.details && (
        <div className="error-details">
          <details>
            <summary>詳細情報</summary>
            <p>{error.details}</p>
          </details>
        </div>
      )}

      {isRetryableError(error) && (
        <div className="error-actions">
          <button className="retry-button" onClick={retryOperation} disabled={isRetrying}>
            {isRetrying ? '再試行中...' : '再試行'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
