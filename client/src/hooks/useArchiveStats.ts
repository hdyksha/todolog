import { useMemo } from 'react';
import { Task } from '../types';

export interface ArchiveStats {
  total: number;
  today: number;
  thisWeek: number;
}

/**
 * アーカイブされたタスク（完了済みタスク）の統計情報を計算するカスタムフック
 */
export const useArchiveStats = (tasks: Task[]): ArchiveStats => {
  return useMemo(() => {
    const archivedTasks = tasks.filter(task => task.completed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const completedToday = archivedTasks.filter(task => {
      const completedDate = new Date(task.updatedAt);
      return completedDate >= today;
    }).length;
    
    const completedThisWeek = archivedTasks.filter(task => {
      const completedDate = new Date(task.updatedAt);
      // 今日完了したタスクも今週に含める
      return completedDate >= startOfWeek;
    }).length;
    
    return {
      total: archivedTasks.length,
      today: completedToday,
      thisWeek: completedThisWeek
    };
  }, [tasks]);
};
