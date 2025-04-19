import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  // 他の設定を追加する場合はここに追加
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // ローカルストレージからテーマ設定を読み込む
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    // システム設定に基づくデフォルト値
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return (savedTheme as Theme) || (prefersDark ? 'dark' : 'light');
  });

  // テーマ切り替え関数
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // テーマが変更されたらローカルストレージに保存し、クラスを更新
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // HTMLのdocument要素にクラスを設定
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const value = {
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
