import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import FilterPanel from '../../components/filters/FilterPanel';
import { Priority } from '../../types';

// MSWサーバーのセットアップ
const server = setupServer(
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

describe('フィルタリングとソート機能', () => {
  it('優先度でフィルタリングできる', async () => {
    // 初期フィルター設定
    const initialFilters = {
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
    
    // 詳細フィルターを表示
    fireEvent.click(screen.getByRole('button', { name: /詳細フィルターを表示/i }));
    
    // 優先度フィルターを選択（高のみ）
    fireEvent.click(screen.getByRole('button', { name: /^高$/i }));
    
    // フィルター変更関数が呼ばれたことを確認
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      priority: Priority.High
    });
  });
  
  it('検索機能が動作する', async () => {
    // 初期フィルター設定
    const initialFilters = {
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
      target: { value: '高優先度' }
    });
    
    // フィルター変更関数が呼ばれたことを確認
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      searchTerm: '高優先度'
    });
  });
  
  it('フィルターをクリアできる', async () => {
    // アクティブなフィルター設定
    const activeFilters = {
      priority: Priority.High,
      category: '仕事',
      searchTerm: '高優先度'
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
    fireEvent.click(screen.getByRole('button', { name: /フィルターをクリア/i }));
    
    // クリア関数が呼ばれたことを確認
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
