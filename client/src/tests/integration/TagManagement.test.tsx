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
afterEach(() => {
  server.resetHandlers();
});

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
    // APIのモック
    const originalFetch = global.fetch;
    const fetchSpy = vi.fn().mockImplementation(async (url, options) => {
      if (url === '/api/tags' && options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        expect(body).toEqual({
          tagName: '新しいタグ',
          color: '#ff00ff'
        });
        return {
          ok: true,
          json: async () => ({
            ...initialTags,
            '新しいタグ': { color: '#ff00ff' }
          })
        };
      }
      return originalFetch(url, options);
    });
    
    global.fetch = fetchSpy;
    
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
    
    // モーダルが閉じたことを確認
    await waitFor(() => {
      expect(screen.queryByText('保存')).not.toBeInTheDocument();
    });
    
    // fetchが呼び出されたことを確認
    expect(fetchSpy).toHaveBeenCalled();
    
    // 元のfetchを復元
    global.fetch = originalFetch;
  });
  
  it('タグを削除できる', async () => {
    // APIのモック
    const originalFetch = global.fetch;
    const fetchSpy = vi.fn().mockImplementation(async (url) => {
      if (url.includes('/api/tags/仕事') && url.includes('DELETE')) {
        return {
          ok: true,
          json: async () => {
            const updatedTags = { ...initialTags };
            delete updatedTags['仕事'];
            return updatedTags;
          }
        };
      }
      return originalFetch(url);
    });
    
    global.fetch = fetchSpy;
    
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
    
    // 「仕事」タグの削除ボタンを見つけてクリック
    const workTagItem = screen.getByText('仕事').closest('.tag-item');
    const deleteButton = workTagItem ? workTagItem.querySelector('button') : null;
    expect(deleteButton).not.toBeNull();
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
    
    // 確認ダイアログが表示されたことを確認
    expect(window.confirm).toHaveBeenCalled();
    
    // 元のfetchを復元
    global.fetch = originalFetch;
  });
});
