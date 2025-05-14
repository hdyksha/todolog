import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TaskProvider } from '../contexts/TaskContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TagProvider } from '../contexts/TagContext';

// テスト用のプロバイダーラッパー
interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TagProvider>
          <TaskProvider>
            {children}
          </TaskProvider>
        </TagProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// カスタムレンダー関数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });

// テスト用のモックデータ
export const mockTasks = [
  {
    id: '1',
    title: 'テストタスク1',
    completed: false,
    priority: 'high',
    category: 'work',
    dueDate: '2025-05-01T00:00:00.000Z',
    createdAt: '2025-04-15T10:00:00.000Z',
    updatedAt: '2025-04-15T10:00:00.000Z',
    memo: 'テストメモ1'
  },
  {
    id: '2',
    title: 'テストタスク2',
    completed: true,
    priority: 'medium',
    category: 'personal',
    dueDate: '2025-04-20T00:00:00.000Z',
    createdAt: '2025-04-10T09:00:00.000Z',
    updatedAt: '2025-04-15T11:00:00.000Z',
    memo: 'テストメモ2'
  },
  {
    id: '3',
    title: 'テストタスク3',
    completed: false,
    priority: 'low',
    createdAt: '2025-04-18T14:00:00.000Z',
    updatedAt: '2025-04-18T14:00:00.000Z'
  }
];

export const mockCategories = [
  { name: 'work', color: '#ff5722' },
  { name: 'personal', color: '#2196f3' },
  { name: 'shopping', color: '#4caf50' }
];

// MSWのセットアップ用のヘルパー関数
export const setupMockServer = () => {
  // MSWのセットアップコードはここに追加
};

// カスタムマッチャー
export const toHaveBeenCalledWithMatch = (received: jest.Mock, expected: object) => {
  const pass = received.mock.calls.some(call => {
    return JSON.stringify(call[0]).includes(JSON.stringify(expected));
  });

  if (pass) {
    return {
      message: () => `expected ${received} not to have been called with a value matching ${expected}`,
      pass: true,
    };
  } else {
    return {
      message: () => `expected ${received} to have been called with a value matching ${expected}`,
      pass: false,
    };
  }
};

// エクスポート
export * from '@testing-library/react';
export { customRender as render };
