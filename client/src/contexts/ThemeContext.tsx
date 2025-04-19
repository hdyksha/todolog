import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// テーマの型定義
type Theme = 'light' | 'dark' | 'system';

// コンテキストの型定義
interface ThemeContextType {
  theme: Theme;
  currentTheme: 'light' | 'dark'; // 実際に適用されているテーマ
  setTheme: (theme: Theme) => void;
}

// コンテキストの作成
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ローカルストレージのキー
const THEME_STORAGE_KEY = 'todolog-theme-preference';

// プロバイダーコンポーネント
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ローカルストレージから保存されたテーマ設定を取得、なければ'system'をデフォルトに
  const getSavedTheme = (): Theme => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (savedTheme as Theme) || 'system';
  };

  const [theme, setThemeState] = useState<Theme>(getSavedTheme());
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // テーマを設定し、ローカルストレージに保存する
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // システムのカラースキーム変更を検知
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    // 初期設定
    if (theme === 'system') {
      setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setCurrentTheme(theme);
    }

    // イベントリスナーの設定
    mediaQuery.addEventListener('change', handleChange);
    
    // クリーンアップ
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // テーマが変更されたらHTML要素のdata-theme属性を更新
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// カスタムフック
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
