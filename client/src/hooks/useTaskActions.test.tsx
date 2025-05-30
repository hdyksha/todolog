import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskActions } from './useTaskActions';
import api from '../services/api';
import { Priority } from '../types';
import { TaskProvider } from '../contexts/TaskContext';

/**
 * 注意: このテストファイルでは「An update to TaskProvider inside a test was not wrapped in act(...)」
 * という警告が表示されることがあります。これは、TaskProviderの内部状態が更新される際に、
 * その全ての更新を完全にact()でラップできていないことが原因です。
 * 
 * 現状では、テストは機能的に正しく動作しており、期待する検証ができているため、
 * この警告は許容しています。将来的なリファクタリングの際に以下の方法で対応を検討します：
 * 
 * 1. TaskProviderをモック化して、内部状態の更新をテストから分離する
 * 2. useTaskActionsフックの実装を変更して、テスト時に状態更新を制御しやすくする
 * 3. テストヘルパーを作成して、非同期更新を適切に処理する
 */

// apiのモック
vi.mock('../services/api', () => ({
  default: {
    fetchTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTaskCompletion: vi.fn(),
    updateTaskMemo: vi.fn(),
  }
}));

describe('useTaskActions フック', () => {
  const mockTask = {
    id: '1',
    title: 'テストタスク',
    completed: false,
    priority: Priority.Medium,
    createdAt: '2025-04-15T10:00:00.000Z',
    updatedAt: '2025-04-15T10:00:00.000Z'
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchTasks: タスク一覧を取得できる', async () => {
    // モックの戻り値を設定
    (api.fetchTasks as vi.Mock).mockResolvedValue([mockTask]);
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );
    
    const { result } = renderHook(() => useTaskActions(), { wrapper });
    
    await act(async () => {
      await result.current.fetchTasks();
    });
    
    expect(api.fetchTasks).toHaveBeenCalledTimes(1);
  });

  it('addTask: 新しいタスクを追加できる', async () => {
    // モックの戻り値を設定
    (api.createTask as vi.Mock).mockResolvedValue({
      ...mockTask,
      id: 'new-task-id',
      title: '新しいタスク'
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );
    
    const { result } = renderHook(() => useTaskActions(), { wrapper });
    
    await act(async () => {
      await result.current.addTask('新しいタスク', Priority.Medium);
    });
    
    expect(api.createTask).toHaveBeenCalledTimes(1);
    expect(api.createTask).toHaveBeenCalledWith({
      title: '新しいタスク',
      priority: Priority.Medium,
      completed: false
    });
  });

  it('updateTask: タスクを更新できる', async () => {
    // モックの戻り値を設定
    const updatedTask = {
      ...mockTask,
      title: '更新されたタスク'
    };
    (api.updateTask as vi.Mock).mockResolvedValue(updatedTask);
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );
    
    const { result } = renderHook(() => useTaskActions(), { wrapper });
    
    await act(async () => {
      await result.current.updateTask(updatedTask);
    });
    
    expect(api.updateTask).toHaveBeenCalledTimes(1);
    expect(api.updateTask).toHaveBeenCalledWith('1', updatedTask);
  });

  it('deleteTask: タスクを削除できる', async () => {
    // モックの戻り値を設定
    (api.deleteTask as vi.Mock).mockResolvedValue(undefined);
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );
    
    const { result } = renderHook(() => useTaskActions(), { wrapper });
    
    await act(async () => {
      await result.current.deleteTask('1');
    });
    
    expect(api.deleteTask).toHaveBeenCalledTimes(1);
    expect(api.deleteTask).toHaveBeenCalledWith('1');
  });

  it('toggleTaskCompletion: タスクの完了状態を切り替えられる', async () => {
    // モックの戻り値を設定
    const toggledTask = {
      ...mockTask,
      completed: true
    };
    (api.toggleTaskCompletion as vi.Mock).mockResolvedValue(toggledTask);
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );
    
    const { result } = renderHook(() => useTaskActions(), { wrapper });
    
    await act(async () => {
      await result.current.toggleTaskCompletion('1');
    });
    
    expect(api.toggleTaskCompletion).toHaveBeenCalledTimes(1);
    expect(api.toggleTaskCompletion).toHaveBeenCalledWith('1');
  });

  it('updateMemo: タスクのメモを更新できる', async () => {
    // モックの戻り値を設定
    const updatedTask = {
      ...mockTask,
      memo: '更新されたメモ'
    };
    (api.updateTaskMemo as vi.Mock).mockResolvedValue(updatedTask);
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );
    
    const { result } = renderHook(() => useTaskActions(), { wrapper });
    
    await act(async () => {
      await result.current.updateMemo('1', '更新されたメモ');
    });
    
    expect(api.updateTaskMemo).toHaveBeenCalledTimes(1);
    expect(api.updateTaskMemo).toHaveBeenCalledWith('1', '更新されたメモ');
  });
});
