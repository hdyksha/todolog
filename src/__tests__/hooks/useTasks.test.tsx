import { renderHook, act } from '@testing-library/react';
import { useTasks } from '../../hooks/useTasks';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { apiService } from '../../services/ApiService';
import React from 'react';

// APIサービスのモック
jest.mock('../../services/ApiService', () => ({
  apiService: {
    getTasks: jest.fn(),
    saveTasks: jest.fn(),
  },
}));

describe('useTasks hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期状態が正しい', () => {
    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTasks(), { wrapper });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.activeTasks).toEqual({});
    expect(result.current.archivedTasks).toEqual({});
    expect(result.current.newTask).toBe('');
    expect(result.current.loading).toBe(true);
  });

  test('タスクを追加できる', () => {
    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTasks(), { wrapper });

    act(() => {
      result.current.addTask('テストタスク');
    });

    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].text).toBe('テストタスク');
    expect(result.current.tasks[0].completed).toBe(false);
  });

  test('タスクの完了状態を切り替えられる', () => {
    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTasks(), { wrapper });

    let taskId;
    act(() => {
      const addResult = result.current.addTask('テストタスク');
      taskId = addResult.data?.id;
    });

    act(() => {
      result.current.toggleTask(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(true);
  });

  test('タスクを削除できる', () => {
    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTasks(), { wrapper });

    let taskId;
    act(() => {
      const addResult = result.current.addTask('テストタスク');
      taskId = addResult.data?.id;
    });

    expect(result.current.tasks.length).toBe(1);

    act(() => {
      result.current.deleteTask(taskId);
    });

    expect(result.current.tasks.length).toBe(0);
  });

  test('ファイルからタスクを読み込める', async () => {
    const mockTasks = [
      { id: '1', text: 'タスク1', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', text: 'タスク2', completed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    
    apiService.getTasks.mockResolvedValue(mockTasks);

    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTasks(), { wrapper });

    await act(async () => {
      await result.current.loadTasksFromFile('test.json');
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.loading).toBe(false);
    expect(apiService.getTasks).toHaveBeenCalledWith('test.json');
  });

  test('タスクをファイルに保存できる', async () => {
    apiService.saveTasks.mockResolvedValue(true);

    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTasks(), { wrapper });

    act(() => {
      result.current.addTask('テストタスク');
    });

    await act(async () => {
      await result.current.saveTasksToFile('test.json');
    });

    expect(apiService.saveTasks).toHaveBeenCalledWith('test.json', expect.any(Array));
    expect(apiService.saveTasks.mock.calls[0][1].length).toBe(1);
    expect(apiService.saveTasks.mock.calls[0][1][0].text).toBe('テストタスク');
  });

  test('タスクをリセットできる', () => {
    const wrapper = ({ children }) => <ErrorProvider>{children}</ErrorProvider>;
    const { result } = renderHook(() => useTasks(), { wrapper });

    act(() => {
      result.current.addTask('テストタスク1');
      result.current.addTask('テストタスク2');
    });

    expect(result.current.tasks.length).toBe(2);

    act(() => {
      result.current.resetTasks();
    });

    expect(result.current.tasks.length).toBe(0);
    expect(result.current.newTask).toBe('');
  });
});
