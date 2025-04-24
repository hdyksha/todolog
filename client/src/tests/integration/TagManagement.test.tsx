import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TaskProvider } from '../../contexts/TaskContext';
import TagManager from '../../components/tags/TagManager';

// 初期タグデータ
const initialTags = {
  '仕事': { color: '#ff0000' },
  '個人': { color: '#00ff00' },
  '買い物': { color: '#0000ff' }
};

// MSWサーバーのセットアップ
const server = setupServer(
  // タグ一覧の取得
  http.get('http://localhost:3001/api/tags', () => {
    return HttpResponse.json(initialTags);
  }),
  
  // 新しいタグの作成
  http.post('http://localhost:3001/api/tags', async ({ request }) => {
    const body = await request.json();
    const updatedTags = {
      ...initialTags,
      [body.tagName]: { color: body.color }
    };
    return HttpResponse.json(updatedTags, { status: 201 });
  }),
  
  // タグの削除
  http.delete('http://localhost:3001/api/tags/:tagName', ({ params }) => {
    const { tagName } = params;
    const updatedTags = { ...initialTags };
    delete updatedTags[tagName as string];
    return HttpResponse.json(updatedTags);
  })
);

// テスト前にサーバーを起動
beforeAll(() => server.listen());

// 各テスト後にリクエストハンドラーをリセット
afterEach(() => server.resetHandlers());

// すべてのテスト後にサーバーを閉じる
afterAll(() => server.close());

describe('タグ管理機能', () => {
  it('タグ一覧が表示される', async () => {
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TagManager />
      </TaskProvider>
    );
    
    // タグが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // すべてのタグが表示されていることを確認
    expect(screen.getByText('仕事')).toBeInTheDocument();
    expect(screen.getByText('個人')).toBeInTheDocument();
    expect(screen.getByText('買い物')).toBeInTheDocument();
  });
  
  it('タグを選択できる', async () => {
    // モック関数の準備
    const onSelectTag = vi.fn();
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TagManager onSelectTag={onSelectTag} />
      </TaskProvider>
    );
    
    // タグが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // タグをクリック
    fireEvent.click(screen.getByText('仕事'));
    
    // 選択関数が呼ばれたことを確認
    expect(onSelectTag).toHaveBeenCalledWith('仕事');
  });
  
  it('新しいタグを追加できる', async () => {
    // 新しいタグ追加後のデータ
    const updatedTags = {
      ...initialTags,
      '新しいタグ': { color: '#cccccc' }
    };
    
    // タグ追加のモックハンドラーを上書き
    server.use(
      http.post('http://localhost:3001/api/tags', async () => {
        return HttpResponse.json(updatedTags, { status: 201 });
      })
    );
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TagManager />
      </TaskProvider>
    );
    
    // タグが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 新しいタグ追加フォームを表示
    const addButton = screen.getByText(/新しいタグを追加/i);
    fireEvent.click(addButton);
    
    // タグ名を入力
    const tagNameInput = screen.getByLabelText(/タグ名/i);
    fireEvent.change(tagNameInput, { target: { value: '新しいタグ' } });
    
    // 色を選択
    const colorInput = screen.getByLabelText(/色/i);
    fireEvent.change(colorInput, { target: { value: '#cccccc' } });
    
    // フォームを送信
    const submitButton = screen.getByText(/保存/i);
    fireEvent.click(submitButton);
    
    // 新しいタグが追加されたことを確認
    await waitFor(() => {
      expect(screen.getByText('新しいタグ')).toBeInTheDocument();
    });
  });
  
  it('タグを削除できる', async () => {
    // 削除後のタグデータ
    const tagsAfterDelete = {
      '個人': { color: '#00ff00' },
      '買い物': { color: '#0000ff' }
    };
    
    // タグ削除のモックハンドラーを上書き
    server.use(
      http.delete('http://localhost:3001/api/tags/:tagName', () => {
        return HttpResponse.json(tagsAfterDelete);
      })
    );
    
    // コンポーネントのレンダリング
    render(
      <TaskProvider>
        <TagManager />
      </TaskProvider>
    );
    
    // タグが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 削除ボタンをクリック（window.confirmをモック）
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
    const deleteButton = screen.getByLabelText('仕事を削除');
    fireEvent.click(deleteButton);
    
    // 確認ダイアログが表示されたことを確認
    expect(confirmSpy).toHaveBeenCalledWith('タグ「仕事」を削除しますか？');
    
    // タグが削除されたことを確認
    await waitFor(() => {
      expect(screen.queryByText('仕事')).not.toBeInTheDocument();
    });
    
    // モックをリセット
    confirmSpy.mockRestore();
  });
});
