# Issue03-1: フロントエンド - プロジェクト構造とベース実装

## 概要

フロントエンド実装の第一フェーズとして、プロジェクト構造の整備とベースとなる実装を行います。モダンなReactアプリケーションの基盤を構築し、今後の開発をスムーズに進めるための土台を作ります。

## 目標

- 効率的な開発のための適切なプロジェクト構造の構築
- 必要なライブラリの導入と設定
- ルーティングの実装
- グローバル状態管理の基盤構築
- APIクライアントの最適化
- 共通UIコンポーネントの作成

## タスク

### 1. 依存関係の追加

- ⬜ React Router Domのインストールと設定
  ```bash
  npm install react-router-dom
  ```

- ⬜ React Queryのインストールと設定
  ```bash
  npm install @tanstack/react-query
  ```

- ⬜ React Hook Formのインストールと設定
  ```bash
  npm install react-hook-form
  ```

- ⬜ Tailwind CSSのインストールと設定
  ```bash
  npm install tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

- ⬜ Zodのインストールと設定
  ```bash
  npm install zod
  ```

- ⬜ Framer Motionのインストールと設定（オプション）
  ```bash
  npm install framer-motion
  ```

### 2. プロジェクト構造の整備

- ⬜ ディレクトリ構造の作成
  ```
  src/
  ├── components/
  │   ├── common/       # 共通コンポーネント
  │   ├── layouts/      # レイアウト
  │   └── ui/           # UIコンポーネント
  ├── features/
  │   ├── tasks/        # タスク関連
  │   ├── categories/   # カテゴリ関連
  │   └── backups/      # バックアップ関連
  ├── hooks/            # カスタムフック
  ├── pages/            # ページコンポーネント
  ├── services/         # APIサービス
  ├── store/            # グローバル状態
  ├── types/            # 型定義
  └── utils/            # ユーティリティ
  ```

- ⬜ 既存コードの新しい構造への移行
  - 既存の型定義の移行
  - 既存のAPIサービスの移行
  - 既存のフックの移行

### 3. ルーティング設定

- ⬜ React Router Domの基本設定
  ```tsx
  // src/App.tsx
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  import MainLayout from './components/layouts/MainLayout';
  import HomePage from './pages/HomePage';
  import TaskDetailPage from './pages/TaskDetailPage';
  import TaskFormPage from './pages/TaskFormPage';
  import BackupPage from './pages/BackupPage';
  import SettingsPage from './pages/SettingsPage';

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tasks/new" element={<TaskFormPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
            <Route path="tasks/:id/edit" element={<TaskFormPage />} />
            <Route path="backups" element={<BackupPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
  ```

- ⬜ 基本的なページコンポーネントの作成
  - HomePage: タスク一覧ページ
  - TaskDetailPage: タスク詳細ページ
  - TaskFormPage: タスク作成/編集ページ
  - BackupPage: バックアップ管理ページ
  - SettingsPage: 設定ページ

- ⬜ レイアウトコンポーネントの基本構造
  - MainLayout: 共通レイアウト（ヘッダー、サイドバー、フッター）

### 4. グローバル状態管理の実装

- ⬜ React Queryの設定
  ```tsx
  // src/main.tsx
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分
        retry: 1,
      },
    },
  });

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
  ```

- ⬜ アプリケーション設定のためのContextの作成
  ```tsx
  // src/store/AppContext.tsx
  import { createContext, useContext, useState, ReactNode } from 'react';

  type Theme = 'light' | 'dark';

  interface AppContextType {
    theme: Theme;
    toggleTheme: () => void;
    // 他の設定...
  }

  const AppContext = createContext<AppContextType | undefined>(undefined);

  export function AppProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    const toggleTheme = () => {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
      <AppContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </AppContext.Provider>
    );
  }

  export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
      throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
  }
  ```

- ⬜ 通知システムのためのContextの作成
  ```tsx
  // src/store/NotificationContext.tsx
  import { createContext, useContext, useState, ReactNode } from 'react';
  import { Notification } from '../types';

  interface NotificationContextType {
    notification: Notification | null;
    showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    hideNotification: () => void;
  }

  const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

  export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<Notification | null>(null);

    const showNotification = (
      message: string,
      type: 'success' | 'error' | 'info' | 'warning',
      duration = 3000
    ) => {
      setNotification({ message, type, duration });
      
      if (duration > 0) {
        setTimeout(() => {
          setNotification(null);
        }, duration);
      }
    };

    const hideNotification = () => {
      setNotification(null);
    };

    return (
      <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
        {children}
      </NotificationContext.Provider>
    );
  }

  export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
      throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
  }
  ```

### 5. APIクライアントの最適化

- ⬜ React Queryを使用したAPIクライアントの再実装
  ```tsx
  // src/services/api/taskApi.ts
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { Task, CreateTaskInput, UpdateTaskInput } from '../../types';
  import { API_BASE_URL } from '../config';

  // タスク一覧を取得するクエリ
  export function useTasks() {
    return useQuery({
      queryKey: ['tasks'],
      queryFn: async (): Promise<Task[]> => {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) {
          throw new Error('タスクの取得に失敗しました');
        }
        return response.json();
      },
    });
  }

  // タスク作成のミューテーション
  export function useCreateTask() {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (taskData: CreateTaskInput): Promise<Task> => {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        
        if (!response.ok) {
          throw new Error('タスクの作成に失敗しました');
        }
        
        return response.json();
      },
      onSuccess: () => {
        // タスク一覧を再取得
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    });
  }

  // 他のAPI関数...
  ```

- ⬜ エラーハンドリングの強化
  ```tsx
  // src/utils/errorHandler.ts
  export class ApiError extends Error {
    status: number;
    
    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }

  export async function handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `API error: ${response.status}`,
        response.status
      );
    }
    return response.json();
  }
  ```

### 6. 共通UIコンポーネントの作成

- ⬜ Buttonコンポーネント
  ```tsx
  // src/components/ui/Button.tsx
  import { ButtonHTMLAttributes, ReactNode } from 'react';

  type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
  type ButtonSize = 'sm' | 'md' | 'lg';

  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
    isLoading?: boolean;
  }

  export function Button({
    variant = 'primary',
    size = 'md',
    children,
    isLoading = false,
    className = '',
    disabled,
    ...props
  }: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    };
    
    const sizeClasses = {
      sm: 'text-sm px-3 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    };
    
    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      isLoading || disabled ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ].join(' ');
    
    return (
      <button
        className={classes}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            処理中...
          </>
        ) : children}
      </button>
    );
  }
  ```

- ⬜ Inputコンポーネント
  ```tsx
  // src/components/ui/Input.tsx
  import { InputHTMLAttributes, forwardRef } from 'react';

  interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
  }

  export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, label, className = '', ...props }, ref) => {
      const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';
      const classes = [
        baseClasses,
        error
          ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
          : 'border-gray-300 focus:border-blue-300 focus:ring-blue-200',
        className,
      ].join(' ');

      return (
        <div className="mb-4">
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
          )}
          <input ref={ref} className={classes} {...props} />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }
  );
  ```

- ⬜ その他の共通コンポーネント
  - Select: ドロップダウン選択
  - Modal: モーダルダイアログ
  - Toast: 通知メッセージ
  - Spinner: ローディングインジケータ

### 7. テーマとスタイリングの基本設定

- ⬜ Tailwind CSSの設定
  ```js
  // tailwind.config.js
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // or 'media'
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            // ...他の色調
            900: '#0c4a6e',
          },
          // 他のカスタムカラー
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          // 他のフォント
        },
      },
    },
    plugins: [],
  }
  ```

- ⬜ グローバルスタイルの設定
  ```css
  /* src/index.css */
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    body {
      @apply bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100;
    }
    h1 {
      @apply text-2xl font-bold;
    }
    h2 {
      @apply text-xl font-semibold;
    }
    /* 他のベーススタイル */
  }

  @layer components {
    .card {
      @apply bg-white dark:bg-gray-800 rounded-lg shadow p-4;
    }
    /* 他の共通コンポーネントスタイル */
  }
  ```

## 成果物

- 整理されたプロジェクト構造
- 必要なライブラリのインストールと設定
- ルーティング設定
- グローバル状態管理の基盤
- 最適化されたAPIクライアント
- 共通UIコンポーネント
- テーマとスタイリングの基本設定

## 注意点

- 既存のコードとの互換性を保ちながら移行する
- 将来の拡張性を考慮した設計を心がける
- コンポーネントは再利用性を重視する
- TypeScriptの型定義を適切に行う
- アクセシビリティを最初から考慮する
