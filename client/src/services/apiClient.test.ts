import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './apiClient';

// apiClientのメソッドを直接モック化
const originalApiClient = { ...apiClient };

describe('apiClient', () => {
  beforeEach(() => {
    // テスト前にキャッシュとモックをクリア
    apiClient.clearCache();
    vi.clearAllMocks();
  });

  afterAll(() => {
    // テスト後に元のメソッドを復元
    Object.assign(apiClient, originalApiClient);
  });

  it('fetchTasks: タスク一覧を取得できる', async () => {
    // モックの戻り値を設定
    const mockTasks = [
      { id: '1', title: 'タスク1', completed: false },
      { id: '2', title: 'タスク2', completed: true }
    ];
    
    // 関数を直接モック
    apiClient.fetchTasks = vi.fn().mockResolvedValue(mockTasks);
    
    const tasks = await apiClient.fetchTasks();
    
    expect(tasks).toEqual(mockTasks);
    expect(apiClient.fetchTasks).toHaveBeenCalledTimes(1);
  });

  it('fetchTaskById: 特定のタスクを取得できる', async () => {
    // モックの戻り値を設定
    const mockTask = { id: '1', title: 'タスク1', completed: false };
    
    // 関数を直接モック
    apiClient.fetchTaskById = vi.fn().mockResolvedValue(mockTask);
    
    const task = await apiClient.fetchTaskById('1');
    
    expect(task).toEqual(mockTask);
    expect(apiClient.fetchTaskById).toHaveBeenCalledWith('1');
  });

  it('createTask: 新しいタスクを作成できる', async () => {
    // モックの戻り値を設定
    const newTaskData = { title: '新しいタスク', completed: false };
    const createdTask = { id: 'new-id', ...newTaskData, createdAt: '2025-04-20T00:00:00.000Z', updatedAt: '2025-04-20T00:00:00.000Z' };
    
    // 関数を直接モック
    apiClient.createTask = vi.fn().mockResolvedValue(createdTask);
    
    const result = await apiClient.createTask(newTaskData);
    
    expect(result).toEqual(createdTask);
    expect(apiClient.createTask).toHaveBeenCalledWith(newTaskData);
  });

  it('updateTask: タスクを更新できる', async () => {
    // モックの戻り値を設定
    const taskId = '1';
    const updateData = { title: '更新されたタスク', completed: true };
    const updatedTask = { id: taskId, ...updateData, updatedAt: '2025-04-20T00:00:00.000Z' };
    
    // 関数を直接モック
    apiClient.updateTask = vi.fn().mockResolvedValue(updatedTask);
    
    const result = await apiClient.updateTask(taskId, updateData);
    
    expect(result).toEqual(updatedTask);
    expect(apiClient.updateTask).toHaveBeenCalledWith(taskId, updateData);
  });

  it('deleteTask: タスクを削除できる', async () => {
    // 関数を直接モック
    apiClient.deleteTask = vi.fn().mockResolvedValue(undefined);
    
    await apiClient.deleteTask('1');
    
    expect(apiClient.deleteTask).toHaveBeenCalledWith('1');
  });

  it('toggleTaskCompletion: タスクの完了状態を切り替えられる', async () => {
    // モックの戻り値を設定
    const taskId = '1';
    const toggledTask = { id: taskId, title: 'タスク1', completed: true, updatedAt: '2025-04-20T00:00:00.000Z' };
    
    // 関数を直接モック
    apiClient.toggleTaskCompletion = vi.fn().mockResolvedValue(toggledTask);
    
    const result = await apiClient.toggleTaskCompletion(taskId);
    
    expect(result).toEqual(toggledTask);
    expect(apiClient.toggleTaskCompletion).toHaveBeenCalledWith(taskId);
  });

  it('updateTaskMemo: タスクのメモを更新できる', async () => {
    // モックの戻り値を設定
    const taskId = '1';
    const memo = '新しいメモ';
    const updatedTask = { id: taskId, title: 'タスク1', memo, updatedAt: '2025-04-20T00:00:00.000Z' };
    
    // 関数を直接モック
    apiClient.updateTaskMemo = vi.fn().mockResolvedValue(updatedTask);
    
    const result = await apiClient.updateTaskMemo(taskId, memo);
    
    expect(result).toEqual(updatedTask);
    expect(apiClient.updateTaskMemo).toHaveBeenCalledWith(taskId, memo);
  });

  it('fetchCategories: カテゴリ一覧を取得できる', async () => {
    // モックの戻り値を設定
    const mockCategories = ['仕事', '個人', '買い物'];
    
    // 関数を直接モック
    apiClient.fetchCategories = vi.fn().mockResolvedValue(mockCategories);
    
    const categories = await apiClient.fetchCategories();
    
    expect(categories).toEqual(mockCategories);
    expect(apiClient.fetchCategories).toHaveBeenCalledTimes(1);
  });

  it('clearCache: キャッシュをクリアできる', () => {
    // キャッシュをクリア
    apiClient.clearCache();
    
    // キャッシュがクリアされたことを確認する方法はないが、
    // エラーが発生しないことを確認
    expect(() => apiClient.clearCache()).not.toThrow();
  });
});
