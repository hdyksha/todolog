import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServerSettings, UpdateServerSettings } from '../types/settings';
import * as settingsApi from '../services/settingsApi';

// デフォルト設定
const defaultServerSettings: ServerSettings = {
  storage: {
    dataDir: './data',
    currentTaskFile: 'tasks.json',
    recentTaskFiles: [],
  },
  app: {
    maxTasksPerPage: 50,
    maxBackups: 10,
  },
};

// コンテキストの型定義
interface ServerSettingsContextType {
  serverSettings: ServerSettings;
  isLoading: boolean;
  error: string | null;
  updateServerSettings: (updates: UpdateServerSettings) => Promise<void>;
  resetServerSettings: () => Promise<void>;
  setDataDirectory: (dataDir: string) => Promise<void>;
  setCurrentTaskFile: (filename: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

// コンテキストの作成
const ServerSettingsContext = createContext<ServerSettingsContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const ServerSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serverSettings, setServerSettings] = useState<ServerSettings>(defaultServerSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 設定を取得する
  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const settings = await settingsApi.fetchServerSettings();
      setServerSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の取得に失敗しました');
      console.error('設定の取得に失敗しました:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 設定を更新する
  const updateServerSettings = async (updates: UpdateServerSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSettings = await settingsApi.updateServerSettings(updates);
      setServerSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の更新に失敗しました');
      console.error('設定の更新に失敗しました:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 設定をリセットする
  const resetServerSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resetSettings = await settingsApi.resetServerSettings();
      setServerSettings(resetSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定のリセットに失敗しました');
      console.error('設定のリセットに失敗しました:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // データディレクトリを設定する
  const setDataDirectory = async (dataDir: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSettings = await settingsApi.setDataDirectory(dataDir);
      setServerSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データディレクトリの設定に失敗しました');
      console.error('データディレクトリの設定に失敗しました:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 現在のタスクファイルを設定する
  const setCurrentTaskFile = async (filename: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSettings = await settingsApi.setCurrentTaskFile(filename);
      setServerSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの設定に失敗しました');
      console.error('タスクファイルの設定に失敗しました:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 設定を再取得する
  const refreshSettings = async () => {
    await fetchSettings();
  };

  // 初回マウント時に設定を取得する
  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ServerSettingsContext.Provider
      value={{
        serverSettings,
        isLoading,
        error,
        updateServerSettings,
        resetServerSettings,
        setDataDirectory,
        setCurrentTaskFile,
        refreshSettings,
      }}
    >
      {children}
    </ServerSettingsContext.Provider>
  );
};

// カスタムフック
export const useServerSettings = () => {
  const context = useContext(ServerSettingsContext);
  if (context === undefined) {
    throw new Error('useServerSettings must be used within a ServerSettingsProvider');
  }
  return context;
};
