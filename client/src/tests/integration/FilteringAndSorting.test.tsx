import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import FilterPanel from '../../components/filters/FilterPanel';
import { Priority } from '../../types';

// モックタグデータ
const mockAvailableTags = {
  '仕事': { color: '#ff0000' },
  '個人': { color: '#00ff00' },
  '買い物': { color: '#0000ff' }
};

// MSWサーバーのセットアップ
const server = setupServer(
  http.get('http://localhost:3001/api/tags', () => {
    return HttpResponse.json(mockAvailableTags);
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
      tags: [],
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
          availableTags={mockAvailableTags}
          onClearFilters={onClearFilters}
        />
      </TaskProvider>
    );
    
    // 詳細フィルターを表示
    fireEvent.click(screen.getByRole('button', { name: /詳細フィルター$/i }));
    
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
      tags: [],
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
          availableTags={mockAvailableTags}
          onClearFilters={onClearFilters}
        />
      </TaskProvider>
    );
    
    // 検索ボックスに入力
    const searchInput = screen.getByPlaceholderText(/タスクを検索/i);
    fireEvent.change(searchInput, { target: { value: 'テスト検索' } });
    
    // フィルター変更関数が呼ばれたことを確認
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      searchTerm: 'テスト検索'
    });
  });
  
  it('タグでフィルタリングできる', async () => {
    // 初期フィルター設定
    const initialFilters = {
      priority: 'all' as const,
      tags: [],
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
          availableTags={mockAvailableTags}
          onClearFilters={onClearFilters}
        />
      </TaskProvider>
    );
    
    // 詳細フィルターを表示
    fireEvent.click(screen.getByRole('button', { name: /詳細フィルター$/i }));
    
    // タグフィルターを選択
    // タグフィルターの実装に依存するため、実際のUIに合わせて調整が必要
    // 例えば、タグ「仕事」をクリックする場合
    await waitFor(() => {
      const tagElement = screen.getByText('仕事');
      fireEvent.click(tagElement);
    });
    
    // フィルター変更関数が呼ばれたことを確認
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      tags: ['仕事']
    }));
  });
});
