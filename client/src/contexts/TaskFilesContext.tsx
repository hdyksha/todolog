import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as settingsApi from '../services/settingsApi';
import { useServerSettings } from './ServerSettingsContext';

// コンテキストの型定義
interface TaskFilesContextType {
  taskFiles: string[];
  recentFiles: string[];
  isLoading: boolean;
  error: string | null;
  fetchTaskFiles: () => Promise<void>;
  fetchRecentFiles: () => Promise<void>;
  createNewTaskFile: (filename: string) => Promise<{ filename: string; message: string }>;
  switchTaskFile: (filename: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
}

// コンテキストの作成
const TaskFilesContext = createContext<TaskFilesContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const TaskFilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskFiles, setTaskFiles] = useState<string[]>([]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshSettings } = useServerSettings();

  // タスクファイル一覧を取得する
  const fetchTaskFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await settingsApi.fetchTaskFiles('.json');
      setTaskFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイル一覧の取得に失敗しました');
      console.error('ファイル一覧の取得に失敗しました:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 最近使用したタスクファイル一覧を取得する
  const fetchRecentFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await settingsApi.fetchRecentTaskFiles();
      // 最近使用したファイルのうち、実際に存在するファイルのみをフィルタリング
      const existingFiles = await settingsApi.fetchTaskFiles('.json');
      const validRecentFiles = files.filter(file => existingFiles.includes(file));
      setRecentFiles(validRecentFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : '最近使用したファイルの取得に失敗しました');
      console.error('最近使用したファイルの取得に失敗しました:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 新しいタスクファイルを作成する
  const createNewTaskFile = useCallback(async (filename: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await settingsApi.createTaskFile(filename);
      // 作成後にファイル一覧を再取得
      await fetchTaskFiles();
      await fetchRecentFiles();
      await refreshSettings();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの作成に失敗しました');
      console.error('タスクファイルの作成に失敗しました:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTaskFiles, fetchRecentFiles, refreshSettings]);

  // 現在のタスクファイルを切り替える
  const switchTaskFile = useCallback(async (filename: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await settingsApi.setCurrentTaskFile(filename);
      // 切り替え後に最近使用したファイル一覧を再取得
      await fetchRecentFiles();
      await refreshSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの切り替えに失敗しました');
      console.error('タスクファイルの切り替えに失敗しました:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecentFiles, refreshSettings]);

  // すべてのファイル情報を更新する
  const refreshFiles = useCallback(async () => {
    await fetchTaskFiles();
    await fetchRecentFiles();
  }, [fetchTaskFiles, fetchRecentFiles]);

  // 初回マウント時にファイル一覧と最近使用したファイル一覧を取得
  useEffect(() => {
    // 初回のみファイル一覧を取得
    const initialLoad = async () => {
      setIsLoading(true);
      try {
        await fetchTaskFiles();
        await fetchRecentFiles();
      } finally {
        setIsLoading(false);
      }
    };
    
    initialLoad();
    // 依存配列を空にして初回のみ実行
  }, []);

  return (
    <TaskFilesContext.Provider
      value={{
        taskFiles,
        recentFiles,
        isLoading,
        error,
        fetchTaskFiles,
        fetchRecentFiles,
        createNewTaskFile,
        switchTaskFile,
        refreshFiles,
      }}
    >
      {children}
    </TaskFilesContext.Provider>
  );
};

// カスタムフック
export const useTaskFiles = () => {
  const context = useContext(TaskFilesContext);
  if (context === undefined) {
    throw new Error('useTaskFiles must be used within a TaskFilesProvider');
  }
  return context;
};
