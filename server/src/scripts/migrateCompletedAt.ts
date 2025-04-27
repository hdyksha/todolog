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
import fs from 'fs/promises';

// 環境変数からデータディレクトリを取得、または現在のディレクトリの下の data を使用
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
    
    console.log(`タスクデータのマイグレーションを開始します: ${fullPath}`);
    
    // ファイルの存在確認
    try {
      await fs.access(fullPath);
    } catch (error) {
      console.error(`ファイルが見つかりません: ${fullPath}`);
      throw new Error(`ファイルが見つかりません: ${fullPath}`);
    }
    
    // ファイルを直接読み込む
    const fileContent = await fs.readFile(fullPath, 'utf8');
    const tasksData = JSON.parse(fileContent) as Task[];
    
    if (!tasksData || !Array.isArray(tasksData)) {
      console.error('タスクデータの読み込みに失敗しました。有効なタスク配列ではありません。');
      throw new Error('タスクデータの読み込みに失敗しました。有効なタスク配列ではありません。');
    }
    
    console.log(`${tasksData.length} 件のタスクデータを処理します`);
    
    // 既に completedAt フィールドがあるタスクの数を確認
    const alreadyMigratedCount = tasksData.filter(task => 'completedAt' in task).length;
    if (alreadyMigratedCount === tasksData.length) {
      console.log('すべてのタスクは既にマイグレーション済みです。変更は行われません。');
      return;
    }
    
    // completedAt フィールドの追加
    const migratedTasks = tasksData.map(task => {
      // 既に completedAt フィールドがある場合はスキップ
      if ('completedAt' in task) {
        return task;
      }
      
      // 完了済みタスクの場合は updatedAt の値を completedAt にコピー
      if (task.completed) {
        console.log(`タスク "${task.title}" に completedAt フィールドを追加: ${task.updatedAt}`);
        return {
          ...task,
          completedAt: task.updatedAt
        };
      }
      
      // 未完了タスクの場合は completedAt を null に設定
      console.log(`タスク "${task.title}" に completedAt フィールドを追加: null`);
      return {
        ...task,
        completedAt: null
      };
    });
    
    // 更新されたデータを直接ファイルに書き込む
    await fs.writeFile(fullPath, JSON.stringify(migratedTasks, null, 2), 'utf8');
    
    const completedTasksCount = migratedTasks.filter(task => task.completed).length;
    const migratedCount = tasksData.length - alreadyMigratedCount;
    
    console.log(`マイグレーション完了: ${migratedCount} 件のタスクデータを更新しました`);
    console.log(`完了済みタスク: ${completedTasksCount} 件`);
    
    return;
  } catch (error) {
    console.error('マイグレーション中にエラーが発生しました', error);
    throw error;
  }
}

export { migrateCompletedAt };
