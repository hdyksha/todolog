import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import CategoryManager from '../../components/categories/CategoryManager';

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

describe('カテゴリ管理機能', () => {
  it('カテゴリ一覧が表示される', async () => {
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <CategoryManager />
      </TaskProvider>
    );
    
    // カテゴリが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // すべてのカテゴリが表示されていることを確認
    expect(screen.getByText('仕事')).toBeInTheDocument();
    expect(screen.getByText('個人')).toBeInTheDocument();
    expect(screen.getByText('買い物')).toBeInTheDocument();
  });
  
  it('カテゴリを選択できる', async () => {
    // モック関数の準備
    const onSelectCategory = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <CategoryManager onSelectCategory={onSelectCategory} />
      </TaskProvider>
    );
    
    // カテゴリが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // カテゴリをクリック
    fireEvent.click(screen.getByText('仕事'));
    
    // 選択関数が呼ばれたことを確認
    expect(onSelectCategory).toHaveBeenCalledWith('仕事');
  });
  
  it('新しいカテゴリを追加できる', async () => {
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <CategoryManager />
      </TaskProvider>
    );
    
    // カテゴリが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 新しいカテゴリを入力
    fireEvent.change(screen.getByPlaceholderText(/新しいカテゴリ名/i), {
      target: { value: '趣味' }
    });
    
    // 追加ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /追加/i }));
    
    // 新しいカテゴリが追加されたことを確認（実際のAPIコールはモックされているため、UIの更新を確認）
    await waitFor(() => {
      expect(screen.getByText('趣味')).toBeInTheDocument();
    });
  });
  
  it('重複するカテゴリ名でエラーが表示される', async () => {
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <CategoryManager />
      </TaskProvider>
    );
    
    // カテゴリが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 既存のカテゴリ名を入力
    fireEvent.change(screen.getByPlaceholderText(/新しいカテゴリ名/i), {
      target: { value: '仕事' }
    });
    
    // 追加ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /追加/i }));
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('同じ名前のカテゴリが既に存在します')).toBeInTheDocument();
    });
  });
});
