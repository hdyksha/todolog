import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import { Priority } from '../types';

// fetchのモック設定
vi.mock('global', () => ({
  fetch: vi.fn()
}));

describe('api', () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    vi.resetAllMocks();
  });

  it('fetchTasks: タスク一覧を取得できる', async () => {
    // モックレスポンスの設定
    const mockTasks = [
      {
        id: '1',
        title: 'テストタスク1',
        completed: false,
        priority: Priority.High,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        dueDate: null
      }
    ];

    // fetchのモック実装
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTasks)
      } as Response)
    );

    // APIを呼び出し
    const result = await api.fetchTasks();

    // 期待する結果の検証
    expect(result).toEqual(mockTasks);
    expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.anything());
  });

  it('createTask: 新しいタスクを作成できる', async () => {
    // 新しいタスクのデータ
    const newTask = {
      title: '新しいタスク',
      priority: Priority.Medium
    };

    // 作成後のタスク（IDなどが追加される）
    const createdTask = {
      id: '123',
      title: '新しいタスク',
      priority: Priority.Medium,
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      dueDate: null
    };

    // fetchのモック実装
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(createdTask)
      } as Response)
    );

    // APIを呼び出し
    const result = await api.createTask(newTask);

    // 期待する結果の検証
    expect(result).toEqual(createdTask);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(newTask)
      })
    );
  });

  it('updateTask: タスクを更新できる', async () => {
    // 更新するタスクのID
    const taskId = '123';
    
    // 更新データ
    const updateData = {
      title: '更新されたタスク',
      priority: Priority.High
    };

    // 更新後のタスク
    const updatedTask = {
      id: taskId,
      title: '更新されたタスク',
      priority: Priority.High,
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
      dueDate: null
    };

    // fetchのモック実装
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(updatedTask)
      } as Response)
    );

    // APIを呼び出し
    const result = await api.updateTask(taskId, updateData);

    // 期待する結果の検証
    expect(result).toEqual(updatedTask);
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/tasks/${taskId}`,
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(updateData)
      })
    );
  });

  it('deleteTask: タスクを削除できる', async () => {
    // 削除するタスクのID
    const taskId = '123';

    // fetchのモック実装
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      } as Response)
    );

    // APIを呼び出し
    await api.deleteTask(taskId);

    // 期待する結果の検証
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/tasks/${taskId}`,
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  it('fetchTags: タグ一覧を取得できる', async () => {
    // モックレスポンスの設定
    const mockTags = {
      '仕事': { color: '#ff0000' },
      '個人': { color: '#00ff00' }
    };

    // fetchのモック実装
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags)
      } as Response)
    );

    // APIを呼び出し
    const result = await api.fetchTags();

    // 期待する結果の検証
    expect(result).toEqual(mockTags);
    expect(global.fetch).toHaveBeenCalledWith('/api/tags');
  });

  it('createTag: 新しいタグを作成できる', async () => {
    // 新しいタグのデータ
    const tagName = '新しいタグ';
    const color = '#cccccc';

    // 作成後のタグ一覧
    const updatedTags = {
      '仕事': { color: '#ff0000' },
      '個人': { color: '#00ff00' },
      '新しいタグ': { color: '#cccccc' }
    };

    // fetchのモック実装
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(updatedTags)
      } as Response)
    );

    // APIを呼び出し
    const result = await api.createTag(tagName, color);

    // 期待する結果の検証
    expect(result).toEqual(updatedTags);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tags',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ tagName, color })
      })
    );
  });

  it('deleteTag: タグを削除できる', async () => {
    // 削除するタグ名
    const tagName = '仕事';

    // 削除後のタグ一覧
    const updatedTags = {
      '個人': { color: '#00ff00' }
    };

    // fetchのモック実装
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(updatedTags)
      } as Response)
    );

    // APIを呼び出し
    const result = await api.deleteTag(tagName);

    // 期待する結果の検証
    expect(result).toEqual(updatedTags);
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/tags/${encodeURIComponent(tagName)}`,
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  it('エラーハンドリング: APIエラー時に例外をスローする', async () => {
    // fetchのモック実装（エラーレスポンス）
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not Found' })
      } as Response)
    );

    // APIを呼び出し、例外が発生することを確認
    await expect(api.fetchTasks()).rejects.toThrow('タスクの取得に失敗しました');
  });
});
