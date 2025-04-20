import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 設定の型定義
interface Settings {
  showArchive: boolean;
  autoExpandArchive: boolean;
  showArchiveStats: boolean;
}

// コンテキストの型定義
interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

// デフォルト設定
const defaultSettings: Settings = {
  showArchive: true,
  autoExpandArchive: false,
  showArchiveStats: true,
};

// ローカルストレージのキー
const SETTINGS_STORAGE_KEY = 'todolog-user-settings';

// コンテキストの作成
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ローカルストレージから保存された設定を取得
  const getSavedSettings = (): Settings => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      return defaultSettings;
    }
  };

  const [settings, setSettings] = useState<Settings>(getSavedSettings());

  // 設定を更新し、ローカルストレージに保存する
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
  };

  // 設定をデフォルトにリセット
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
  };

  // 初回マウント時に設定を読み込む
  useEffect(() => {
    setSettings(getSavedSettings());
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// カスタムフック
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
