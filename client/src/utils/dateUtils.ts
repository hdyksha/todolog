/**
 * タスクを日付ごとにグループ化する
 * @param tasks タスクの配列
 * @returns 日付ごとにグループ化されたタスク
 */
import { Task } from '../types';

export interface TasksByDate {
  [date: string]: Task[];
}

/**
 * タスクを完了日（updatedAt）に基づいて日付ごとにグループ化する
 */
export const groupTasksByDate = (tasks: Task[]): TasksByDate => {
  return tasks.reduce((groups, task) => {
    // タスクの完了日（updatedAt）から日付部分のみを抽出
    const dateStr = new Date(task.updatedAt).toISOString().split('T')[0];
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    
    groups[dateStr].push(task);
    return groups;
  }, {} as TasksByDate);
};

/**
 * 日付を「YYYY年MM月DD日（曜日）」形式でフォーマットする
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  
  return `${year}年${month}月${day}日（${dayOfWeek}）`;
};
