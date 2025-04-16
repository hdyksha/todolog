import React, { createContext, useContext, ReactNode } from 'react';
import { useTaskFiles } from '../hooks/useTaskFiles';
import { TaskFile } from '../services/ApiService';

// コンテキストの型定義
interface FileContextType {
  // 状態
  taskFiles: TaskFile[];
  currentFile: string;
  newFileName: string;
  fileLoading: boolean;
  error: string | null;

  // アクション
  setCurrentFile: (filename: string) => void;
  setNewFileName: (name: string) => void;
  loadTaskFiles: () => Promise<string | null>;
  createNewFile: () => Promise<string | null>;
  deleteFile: (filename: string) => Promise<{ success: boolean; nextFile: string | null }>;
  clearError: () => void;
}

// コンテキストの作成
const FileContext = createContext<FileContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const fileHook = useTaskFiles();

  return <FileContext.Provider value={fileHook}>{children}</FileContext.Provider>;
};

// カスタムフック
export const useFileContext = (): FileContextType => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};
