import { renderHook } from '@testing-library/react';
import { useArchiveStats } from './useArchiveStats';
import { Task, Priority } from '../types';

describe('useArchiveStats', () => {
  // テスト用のモックデータ
  const mockTasks: Task[] = [
    // 今日完了したタスク
    {
      id: '1',
      title: '今日完了したタスク',
      completed: true,
      priority: Priority.Medium,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // 昨日完了したタスク
    {
      id: '2',
      title: '昨日完了したタスク',
      completed: true,
      priority: Priority.Low,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // 先週完了したタスク
    {
      id: '3',
      title: '先週完了したタスク',
      completed: true,
      priority: Priority.High,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // 未完了のタスク
    {
      id: '4',
      title: '未完了のタスク',
      completed: false,
      priority: Priority.Medium,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('日付に基づいて正しく統計情報を計算する', () => {
    // 日付をモック
    const originalDate = global.Date;
    const mockDate = new Date('2025-04-20T12:00:00Z'); // 日曜日
    
    // 日付のモック関数を作成
    global.Date = class extends Date {
      constructor(date?: any) {
        if (date) {
          return new originalDate(date);
        }
        return new originalDate(mockDate);
      }
      static now() {
        return mockDate.getTime();
      }
    } as any;

    // テスト用のタスクデータを作成
    const testTasks: Task[] = [
      // 今日（日曜日）完了したタスク
      {
        id: '1',
        title: '今日完了したタスク',
        completed: true,
        priority: Priority.Medium,
        createdAt: new Date('2025-04-20T08:00:00Z').toISOString(),
        updatedAt: new Date('2025-04-20T10:00:00Z').toISOString(),
      },
      // 今週（金曜日）完了したタスク
      {
        id: '2',
        title: '今週完了したタスク',
        completed: true,
        priority: Priority.Low,
        createdAt: new Date('2025-04-18T08:00:00Z').toISOString(),
        updatedAt: new Date('2025-04-18T10:00:00Z').toISOString(),
      },
      // 先週完了したタスク
      {
        id: '3',
        title: '先週完了したタスク',
        completed: true,
        priority: Priority.High,
        createdAt: new Date('2025-04-10T08:00:00Z').toISOString(),
        updatedAt: new Date('2025-04-10T10:00:00Z').toISOString(),
      },
      // 未完了のタスク
      {
        id: '4',
        title: '未完了のタスク',
        completed: false,
        priority: Priority.Medium,
        createdAt: new Date('2025-04-20T08:00:00Z').toISOString(),
        updatedAt: new Date('2025-04-20T08:00:00Z').toISOString(),
      },
    ];

    // フックをレンダリング
    const { result } = renderHook(() => useArchiveStats(testTasks));

    // 期待される結果
    expect(result.current.total).toBe(3); // 完了済みタスクの総数
    expect(result.current.today).toBe(1); // 今日完了したタスク数
    expect(result.current.thisWeek).toBe(1); // 今週完了したタスク数（今日の1件）

    // モックをリセット
    global.Date = originalDate;
  });

  it('タスクが空の場合は0を返す', () => {
    const { result } = renderHook(() => useArchiveStats([]));
    expect(result.current.total).toBe(0);
    expect(result.current.today).toBe(0);
    expect(result.current.thisWeek).toBe(0);
  });

  it('完了済みタスクがない場合は0を返す', () => {
    const incompleteTasks: Task[] = [
      {
        id: '1',
        title: '未完了のタスク1',
        completed: false,
        priority: Priority.Medium,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: '未完了のタスク2',
        completed: false,
        priority: Priority.High,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const { result } = renderHook(() => useArchiveStats(incompleteTasks));
    expect(result.current.total).toBe(0);
    expect(result.current.today).toBe(0);
    expect(result.current.thisWeek).toBe(0);
  });
});
