import { z } from 'zod';
import { TaskSchema } from '../models/task.model.js';
import { logger } from './logger.js';

// タスク配列のスキーマ
const TasksArraySchema = z.array(TaskSchema);

// データ検証関数
export async function validateTasksData(data: unknown): Promise<boolean> {
  try {
    TasksArraySchema.parse(data);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('データ検証エラー:', error.errors);
    }
    return false;
  }
}

// データ修復関数
export async function repairTasksData(data: unknown): Promise<any[]> {
  if (!Array.isArray(data)) {
    logger.warn('データが配列ではありません。空の配列を返します。');
    return [];
  }

  // 有効なタスクのみをフィルタリング
  const validTasks = data.filter(item => {
    try {
      TaskSchema.parse(item);
      return true;
    } catch (error) {
      logger.warn(`無効なタスクデータをスキップします: ${JSON.stringify(item)}`);
      return false;
    }
  });

  return validTasks;
}
