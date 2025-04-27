import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import TaskList from '../../components/TaskList';
import FilterPanel from '../../components/filters/FilterPanel';
import { Priority, Task } from '../../types';

// テスト用のモックタスク
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'プレゼンテーション資料作成',
    completed: false,
    priority: Priority.High,
    createdAt: new Date('2025-04-15T10:00:00.000Z'),
    updatedAt: new Date('2025-04-15T10:00:00.000Z'),
    memo: '会議用の資料を準備する'
  },
  {
    id: 'task-2',
    title: '買い物リスト作成',
    completed: false,
    priority: Priority.Medium,
    createdAt: new Date('2025-04-14T10:00:00.000Z'),
    updatedAt: new Date('2025-04-16T10:00:00.000Z'),
    memo: '週末のパーティー用の食材を購入'
  },
  {
    id: 'task-3',
    title: 'ジムに行く',
    completed: false,
    priority: Priority.Low,
    createdAt: new Date('2025-04-16T10:00:00.000Z'),
    updatedAt: new Date('2025-04-16T10:00:00.000Z'),
    memo: '有酸素運動30分、筋トレ20分'
  }
];

// MSWサーバーのセットアップ
const server = setupServer(
  http.get('http://localhost:3001/api/tasks', () => {
    return HttpResponse.json(mockTasks);
  }),
  
  http.get('http://localhost:3001/api/categories', () => {
    return HttpResponse.json(['仕事', '個人', '買い物']);
  })
);

// テスト前にサーバーを起動
beforeAll(() => server.listen());

// 各テスト後にリクエストハンドラーをリセット
afterEach(() => server.resetHandlers());

// すべてのテスト後にサーバーを閉じる
afterAll(() => server.close());

describe('検索機能', () => {
  it('検索フィルターが適用される', async () => {
    // 初期フィルター設定
    const initialFilters = {
      status: 'all' as const,
      priority: 'all' as const,
      category: null,
      searchTerm: ''
    };
    
    // モック関数の準備
    const onFilterChange = vi.fn();
    const onClearFilters = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <FilterPanel 
          filters={initialFilters}
          onFilterChange={onFilterChange}
          categories={['仕事', '個人', '買い物']}
          onClearFilters={onClearFilters}
        />
      </TaskProvider>
    );
    
    // 検索ワードを入力
    fireEvent.change(screen.getByPlaceholderText(/タスクを検索/i), {
      target: { value: 'プレゼン' }
    });
    
    // フィルター変更関数が呼ばれたことを確認
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      searchTerm: 'プレゼン'
    });
  });
  
  it('検索フィルターをクリアできる', async () => {
    // アクティブなフィルター設定
    const activeFilters = {
      status: 'all' as const,
      priority: 'all' as const,
      category: null,
      searchTerm: 'プレゼン'
    };
    
    // モック関数の準備
    const onFilterChange = vi.fn();
    const onClearFilters = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <FilterPanel 
          filters={activeFilters}
          onFilterChange={onFilterChange}
          categories={['仕事', '個人', '買い物']}
          onClearFilters={onClearFilters}
        />
      </TaskProvider>
    );
    
    // フィルターをクリアボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /クリア$/i }));
    
    // クリア関数が呼ばれたことを確認
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
