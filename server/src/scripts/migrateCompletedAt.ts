/**
 * マイグレーションスクリプト: タスクデータに completedAt フィールドを追加
 * 
 * 既存の完了済みタスクには updatedAt の値を completedAt にコピーします
 * 
 * 使用方法:
 * npm run migrate:completedAt -- [ファイル名]
 * 
 * 例:
 * npm run migrate:completedAt -- tasks.json
 * npm run migrate:completedAt -- backup/tasks-2025-04-01.json
 */

import path from 'path';
import { getFileService } from '../services/serviceContainer.js';
import { Task } from '../models/task.model.js';
import { logger } from '../utils/logger.js';
import fs from 'fs/promises';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DEFAULT_TASKS_FILE = 'tasks.json';

/**
 * 指定されたファイルのタスクデータに completedAt フィールドを追加する
 * @param filePath 対象ファイルのパス（DATA_DIRからの相対パスまたは絶対パス）
 */
async function migrateCompletedAt(filePath?: string): Promise<void> {
  try {
    // ファイルパスの決定
    const targetFile = filePath || DEFAULT_TASKS_FILE;
    const fullPath = path.isAbsolute(targetFile) 
      ? targetFile 
      : path.join(DATA_DIR, targetFile);
    
    logger.info(`タスクデータのマイグレーションを開始します: ${fullPath}`);
    
    // ファイルの存在確認
    try {
      await fs.access(fullPath);
    } catch (error) {
      logger.error(`ファイルが見つかりません: ${fullPath}`);
      throw new Error(`ファイルが見つかりません: ${fullPath}`);
    }
    
    // FileServiceの取得
    const fileService = getFileService();
    
    // タスクデータの読み込み
    const tasksData = await fileService.readJsonFile<Task[]>(fullPath);
    
    if (!tasksData || !Array.isArray(tasksData)) {
      logger.error('タスクデータの読み込みに失敗しました。有効なタスク配列ではありません。');
      throw new Error('タスクデータの読み込みに失敗しました。有効なタスク配列ではありません。');
    }
    
    logger.info(`${tasksData.length} 件のタスクデータを処理します`);
    
    // completedAt フィールドの追加
    const migratedTasks = tasksData.map(task => {
      // 既に completedAt フィールドがある場合はスキップ
      if ('completedAt' in task) {
        return task;
      }
      
      // 完了済みタスクの場合は updatedAt の値を completedAt にコピー
      if (task.completed) {
        return {
          ...task,
          completedAt: task.updatedAt
        };
      }
      
      // 未完了タスクの場合は completedAt を null に設定
      return {
        ...task,
        completedAt: null
      };
    });
    
    // 更新されたデータの保存
    await fileService.writeJsonFile(fullPath, migratedTasks);
    
    const completedTasksCount = migratedTasks.filter(task => task.completed).length;
    logger.info(`マイグレーション完了: ${migratedTasks.length} 件のタスクデータを更新しました`);
    logger.info(`完了済みタスク: ${completedTasksCount} 件`);
    
    return;
  } catch (error) {
    logger.error('マイグレーション中にエラーが発生しました', error);
    throw error;
  }
}

// スクリプトが直接実行された場合のみ実行
if (process.argv[1] === import.meta.url) {
  // コマンドライン引数からファイルパスを取得
  const targetFile = process.argv[2];
  
  migrateCompletedAt(targetFile)
    .then(() => {
      logger.info('マイグレーションが正常に完了しました');
      process.exit(0);
    })
    .catch(error => {
      logger.error('マイグレーションに失敗しました', error);
      process.exit(1);
    });
}

export { migrateCompletedAt };
