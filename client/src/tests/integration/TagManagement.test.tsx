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
  http.get('/api/tags', () => {
    return HttpResponse.json(initialTags);
  }),
  
  // 新しいタグの作成
  http.post('/api/tags', async ({ request }) => {
    const body = await request.json();
    const updatedTags = {
      ...initialTags,
      [body.tagName]: { color: body.color }
    };
    return HttpResponse.json(updatedTags, { status: 201 });
  }),
  
  // タグの削除
  http.delete('/api/tags/:tagName', ({ params }) => {
    const { tagName } = params;
    const updatedTags = { ...initialTags };
    delete updatedTags[tagName as string];
    return HttpResponse.json(updatedTags);
  })
);

// テスト前にモックサーバーを起動
beforeAll(() => server.listen());

// 各テスト後にリクエストハンドラーをリセット
afterEach(() => server.resetHandlers());

// すべてのテスト後にモックサーバーを閉じる
afterAll(() => server.close());

describe('タグ管理機能', () => {
  it('タグ一覧が表示される', async () => {
    render(
      <TaskProvider>
        <TagManager />
      </TaskProvider>
    );
    
    // タグが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
      expect(screen.getByText('個人')).toBeInTheDocument();
      expect(screen.getByText('買い物')).toBeInTheDocument();
    });
  });
  
  it('新しいタグを追加できる', async () => {
    render(
      <TaskProvider>
        <TagManager />
      </TaskProvider>
    );
    
    // 「新しいタグを追加」ボタンをクリック
    await waitFor(() => {
      const addButton = screen.getByText('新しいタグを追加');
      fireEvent.click(addButton);
    });
    
    // フォームに入力
    const nameInput = screen.getByLabelText(/タグ名/i);
    fireEvent.change(nameInput, { target: { value: '新しいタグ' } });
    
    const colorInput = screen.getByLabelText(/色/i);
    fireEvent.change(colorInput, { target: { value: '#ff00ff' } });
    
    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    // 新しいタグが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('新しいタグ')).toBeInTheDocument();
    });
  });
  
  it('タグを削除できる', async () => {
    render(
      <TaskProvider>
        <TagManager />
      </TaskProvider>
    );
    
    // タグが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('仕事')).toBeInTheDocument();
    });
    
    // 確認ダイアログをモック
    window.confirm = vi.fn(() => true);
    
    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: /を削除/i });
    fireEvent.click(deleteButtons[0]);
    
    // 確認ダイアログが表示されたことを確認
    expect(window.confirm).toHaveBeenCalled();
    
    // タグが削除されたことを確認
    await waitFor(() => {
      expect(screen.queryByText('仕事')).not.toBeInTheDocument();
    });
  });
});
