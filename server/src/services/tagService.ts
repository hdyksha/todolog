import { promises as fsPromises } from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { TaskService } from './taskService.js';
import { getTaskService } from './serviceContainer.js';

// タグの型定義
interface Tag {
  color: string;
  description?: string;
}

export class TagService {
  private taskService: TaskService | null = null;
  
  constructor(taskService?: TaskService) {
    this.taskService = taskService || null;
  }
  
  /**
   * タスクサービスを設定
   * @param taskService タスクサービスのインスタンス
   */
  setTaskService(taskService: TaskService) {
    this.taskService = taskService;
  }

  /**
   * タグファイルのパスを取得
   * @returns タグファイルの完全パス
   */
  private getTagsFilePath(): string {
    return path.join(env.DATA_DIR, 'tags.json');
  }

  /**
   * データディレクトリの存在を確認し、必要に応じて作成する
   */
  private async ensureDataDirectory(): Promise<void> {
    const dirPath = path.dirname(this.getTagsFilePath());
    
    try {
      await fsPromises.access(dirPath);
    } catch (error) {
      // ディレクトリが存在しない場合は作成
      logger.info(`タグ用ディレクトリを作成します: ${dirPath}`);
      await fsPromises.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * すべてのタグを取得
   * @returns タグ名をキーとするタグオブジェクトのマップ
   */
  async getAllTags(): Promise<Record<string, Tag>> {
    try {
      const filePath = this.getTagsFilePath();
      
      try {
        await fsPromises.access(filePath);
      } catch (error) {
        // ファイルが存在しない場合は空のオブジェクトを返す
        logger.info('タグファイルが存在しないため、空のタグリストを返します');
        return {};
      }
      
      const data = await fsPromises.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('タグの取得に失敗しました', { error: (error as Error).message });
      return {};
    }
  }

  /**
   * タグを保存
   * @param tags 保存するタグオブジェクト
   */
  async saveTags(tags: Record<string, Tag>): Promise<void> {
    try {
      await this.ensureDataDirectory();
      const filePath = this.getTagsFilePath();
      
      logger.info(`タグを保存します: ${Object.keys(tags).length}件`);
      await fsPromises.writeFile(filePath, JSON.stringify(tags, null, 2), 'utf-8');
    } catch (error) {
      logger.error('タグの保存に失敗しました', { error: (error as Error).message });
      throw new Error(`タグの保存に失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * 新しいタグを作成
   * @param name タグ名
   * @param tag タグオブジェクト
   * @returns 作成されたタグオブジェクト
   */
  async createTag(name: string, tag: Tag): Promise<Tag> {
    try {
      const tags = await this.getAllTags();
      
      if (tags[name]) {
        logger.warn(`タグ "${name}" は既に存在します`);
        throw new Error(`タグ "${name}" は既に存在します`);
      }
      
      tags[name] = tag;
      await this.saveTags(tags);
      
      logger.info(`新しいタグを作成しました: ${name}`);
      return tag;
    } catch (error) {
      logger.error(`タグ "${name}" の作成に失敗しました`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * タグを更新
   * @param name タグ名
   * @param tag 更新するタグオブジェクト
   * @returns 更新されたタグオブジェクトまたはnull
   */
  async updateTag(name: string, tag: Tag): Promise<Tag | null> {
    try {
      const tags = await this.getAllTags();
      
      if (!tags[name]) {
        logger.warn(`更新対象のタグ "${name}" が見つかりません`);
        return null;
      }
      
      tags[name] = tag;
      await this.saveTags(tags);
      
      logger.info(`タグを更新しました: ${name}`);
      return tag;
    } catch (error) {
      logger.error(`タグ "${name}" の更新に失敗しました`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * タグを削除
   * @param name 削除するタグ名
   * @returns 削除成功の場合true、タグが見つからない場合false
   */
  async deleteTag(name: string): Promise<boolean> {
    try {
      const tags = await this.getAllTags();
      
      if (!tags[name]) {
        logger.warn(`削除対象のタグ "${name}" が見つかりません`);
        return false;
      }
      
      delete tags[name];
      await this.saveTags(tags);
      
      // 関連するタスクからもタグを削除
      await this.removeTagFromTasks(name);
      
      logger.info(`タグを削除しました: ${name}`);
      return true;
    } catch (error) {
      logger.error(`タグ "${name}" の削除に失敗しました`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * すべてのタスクから指定したタグを削除
   * @param tagName 削除するタグ名
   */
  private async removeTagFromTasks(tagName: string): Promise<void> {
    try {
      // TaskServiceが設定されていない場合は取得を試みる
      const taskService = this.taskService || this.getTaskServiceInstance();
      
      if (taskService) {
        await taskService.removeTagFromAllTasks(tagName);
      } else {
        logger.warn('TaskServiceが利用できないため、タスクからタグを削除できません', { tag: tagName });
      }
    } catch (error) {
      logger.error(`タスクからタグ "${tagName}" の削除に失敗しました`, { error: (error as Error).message });
    }
  }

  /**
   * TaskServiceのインスタンスを取得
   * @returns TaskServiceのインスタンスまたはnull
   */
  private getTaskServiceInstance(): TaskService | null {
    try {
      return getTaskService();
    } catch (error) {
      logger.warn('TaskServiceの取得に失敗しました', { error: (error as Error).message });
      return null;
    }
  }

  /**
   * タグの使用状況を取得
   * @returns タグ名をキーとする使用回数のマップ
   */
  async getTagUsage(): Promise<Record<string, number>> {
    try {
      // TaskServiceのインスタンスを取得
      const taskService = this.taskService || this.getTaskServiceInstance();
      
      if (!taskService) {
        logger.warn('TaskServiceが利用できないため、タグの使用状況を取得できません');
        return {};
      }
      
      const tasks = await taskService.getAllTasks();
      const usage: Record<string, number> = {};
      
      // すべてのタグを初期化
      const tags = await this.getAllTags();
      Object.keys(tags).forEach(tag => {
        usage[tag] = 0;
      });
      
      // タスクごとにタグの使用回数をカウント
      tasks.forEach(task => {
        if (task.tags && Array.isArray(task.tags)) {
          task.tags.forEach(tag => {
            if (usage[tag] !== undefined) {
              usage[tag]++;
            } else {
              usage[tag] = 1;
            }
          });
        }
      });
      
      return usage;
    } catch (error) {
      logger.error('タグの使用状況の取得に失敗しました', { error: (error as Error).message });
      throw error;
    }
  }
}
