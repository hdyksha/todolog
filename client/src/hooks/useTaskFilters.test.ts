import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskFilters } from './useTaskFilters';
import { Task, Priority } from '../types';

describe('useTaskFilters フック', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'タスク1',
      completed: false,
      priority: Priority.High,
      tags: ['タグA'],
      dueDate: '2025-05-01T00:00:00.000Z',
      createdAt: '2025-04-15T10:00:00.000Z',
      updatedAt: '2025-04-15T10:00:00.000Z',
      memo: 'メモ1'
    },
    {
      id: '2',
      title: 'タスク2',
      completed: true,
      priority: Priority.Medium,
      tags: ['タグB'],
      createdAt: '2025-04-16T10:00:00.000Z',
      updatedAt: '2025-04-16T10:00:00.000Z',
    },
    {
      id: '3',
      title: '重要なタスク',
      completed: false,
      priority: Priority.Low,
      createdAt: '2025-04-17T10:00:00.000Z',
      updatedAt: '2025-04-17T10:00:00.000Z',
    }
  ];

  it('初期状態では全てのタスクが表示される', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    
    expect(result.current.filteredTasks).toHaveLength(3);
    expect(result.current.sortedTasks).toHaveLength(3);
    
    // デフォルトでは作成日の降順でソートされる
    expect(result.current.sortedTasks[0].id).toBe('3');
    expect(result.current.sortedTasks[1].id).toBe('2');
    expect(result.current.sortedTasks[2].id).toBe('1');
  });

  it('優先度フィルターが正しく動作する', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    
    // 高優先度のタスクのみ表示
    act(() => {
      result.current.setFilters({ ...result.current.filters, priority: Priority.High });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].priority).toBe(Priority.High);
    
    // 中優先度のタスクのみ表示
    act(() => {
      result.current.setFilters({ ...result.current.filters, priority: Priority.Medium });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].priority).toBe(Priority.Medium);
    
    // 低優先度のタスクのみ表示
    act(() => {
      result.current.setFilters({ ...result.current.filters, priority: Priority.Low });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].priority).toBe(Priority.Low);
  });

  it('タグフィルターが正しく動作する', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    
    // タグAのタスクのみ表示
    act(() => {
      result.current.setFilters({ ...result.current.filters, tags: ['タグA'] });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].tags).toContain('タグA');
    
    // タグBのタスクのみ表示
    act(() => {
      result.current.setFilters({ ...result.current.filters, tags: ['タグB'] });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].tags).toContain('タグB');
  });

  it('検索フィルターが正しく動作する', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    
    // タイトルで検索
    act(() => {
      result.current.setFilters({ ...result.current.filters, searchTerm: '重要' });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].id).toBe('3');
    
    // メモで検索
    act(() => {
      result.current.setFilters({ ...result.current.filters, searchTerm: 'メモ1' });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].id).toBe('1');
    
    // タグで検索
    act(() => {
      result.current.setFilters({ ...result.current.filters, searchTerm: 'タグA' });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].id).toBe('1');
  });

  it('複数のフィルターを組み合わせることができる', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    
    // 高優先度かつタグAのタスク
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        priority: Priority.High,
        tags: ['タグA']
      });
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].id).toBe('1');
    
    // 低優先度かつタグBのタスク（該当なし）
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        priority: Priority.Low,
        tags: ['タグB']
      });
    });
    
    expect(result.current.filteredTasks).toHaveLength(0);
  });

  it('フィルターをリセットできる', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    
    // フィルターを設定
    act(() => {
      result.current.setFilters({
        priority: Priority.High,
        tags: ['カテゴリA'],
        searchTerm: '重要'
      });
    });
    
    // フィルターをリセット
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.filters).toEqual({
      priority: 'all',
      tags: [],
      searchTerm: '',
      tagFilterMode: 'any'
    });
    expect(result.current.filteredTasks).toHaveLength(3);
  });

  it('ソートが正しく動作する', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    
    // タイトルの昇順でソート
    act(() => {
      result.current.setSort({ field: 'title', direction: 'asc' });
    });
    
    expect(result.current.sortedTasks[0].title).toBe('タスク1');
    expect(result.current.sortedTasks[1].title).toBe('タスク2');
    expect(result.current.sortedTasks[2].title).toBe('重要なタスク');
    
    // タイトルの降順でソート
    act(() => {
      result.current.setSort({ field: 'title', direction: 'desc' });
    });
    
    expect(result.current.sortedTasks[0].title).toBe('重要なタスク');
    expect(result.current.sortedTasks[1].title).toBe('タスク2');
    expect(result.current.sortedTasks[2].title).toBe('タスク1');
    
    // 優先度でソート
    act(() => {
      result.current.setSort({ field: 'priority', direction: 'desc' });
    });
    
    expect(result.current.sortedTasks[0].priority).toBe(Priority.High);
    expect(result.current.sortedTasks[1].priority).toBe(Priority.Medium);
    expect(result.current.sortedTasks[2].priority).toBe(Priority.Low);
  });

  it('期限でのソートが正しく動作する', () => {
    const { result } = renderHook(() => useTaskFilters(mockTasks));
    
    // 期限の昇順でソート（期限がないタスクは後ろに表示）
    act(() => {
      result.current.setSort({ field: 'dueDate', direction: 'asc' });
    });
    
    // 期限があるタスクが先頭に来ることを確認
    const tasksWithDueDate = result.current.sortedTasks.filter(task => task.dueDate);
    expect(tasksWithDueDate.length).toBe(1);
    expect(tasksWithDueDate[0].id).toBe('1');
    
    // 期限の降順でソート
    act(() => {
      result.current.setSort({ field: 'dueDate', direction: 'desc' });
    });
    
    // 期限があるタスクが先頭に来ることを確認
    const tasksWithDueDate2 = result.current.sortedTasks.filter(task => task.dueDate);
    expect(tasksWithDueDate2.length).toBe(1);
    expect(tasksWithDueDate2[0].id).toBe('1');
  });
});
