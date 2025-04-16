import React, { createContext, useContext, ReactNode } from 'react';
import { useErrorHandler, ErrorInfo } from '../hooks/useErrorHandler';

// エラーコンテキストの型定義
interface ErrorContextType {
  error: ErrorInfo | null;
  isRetrying: boolean;
  handleError: (err: unknown, retryFn?: () => Promise<void>) => void;
  clearError: () => void;
  retryOperation: () => Promise<void>;
}

// コンテキストの作成
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// プロバイダーコンポーネントのプロパティ
interface ErrorProviderProps {
  children: ReactNode;
  autoClearTimeout?: number;
}

// プロバイダーコンポーネント
export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children, autoClearTimeout }) => {
  const errorHandler = useErrorHandler({ autoClearTimeout });

  return <ErrorContext.Provider value={errorHandler}>{children}</ErrorContext.Provider>;
};

// カスタムフック
export const useErrorContext = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};
