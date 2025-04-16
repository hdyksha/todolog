import React, { createContext, useContext, ReactNode } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import { Task } from '../types/Task';

// コンテキストの型定義
interface AutoSaveContextType {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveTasksNow: () => Promise<boolean>;
  clearError: () => void;
}

interface AutoSaveProviderProps {
  children: ReactNode;
  tasks: Task[];
  currentFile: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

// コンテキストの作成
const AutoSaveContext = createContext<AutoSaveContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const AutoSaveProvider: React.FC<AutoSaveProviderProps> = ({
  children,
  tasks,
  currentFile,
  onSaveSuccess,
  onSaveError,
}) => {
  const autoSaveHook = useAutoSave(tasks, currentFile, {
    onSaveSuccess,
    onSaveError,
  });

  return <AutoSaveContext.Provider value={autoSaveHook}>{children}</AutoSaveContext.Provider>;
};

// カスタムフック
export const useAutoSaveContext = (): AutoSaveContextType => {
  const context = useContext(AutoSaveContext);
  if (context === undefined) {
    throw new Error('useAutoSaveContext must be used within an AutoSaveProvider');
  }
  return context;
};
