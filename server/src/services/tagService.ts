import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { TaskService } from './taskService.js';

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
   */
  setTaskService(taskService: TaskService) {
    this.taskService = taskService;
  }

  /**
   * タグファイルのパスを取得
   */
  getTagsFilePath() {
    return path.join(env.DATA_DIR, 'tags.json');
  }

  /**
   * すべてのタグを取得
   */
  async getAllTags(): Promise<Record<string, Tag>> {
    try {
      const filePath = this.getTagsFilePath();
      
      try {
        await fs.access(filePath);
      } catch (error) {
        // ファイルが存在しない場合は空のオブジェクトを返す
        return {};
      }
      
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to get all tags', { error });
      return {};
    }
  }

  /**
   * タグを保存
   */
  async saveTags(tags: Record<string, Tag>): Promise<void> {
    try {
      const filePath = this.getTagsFilePath();
      const dirPath = path.dirname(filePath);
      
      try {
        await fs.access(dirPath);
      } catch (error) {
        // ディレクトリが存在しない場合は作成
        await fs.mkdir(dirPath, { recursive: true });
      }
      
      await fs.writeFile(filePath, JSON.stringify(tags, null, 2), 'utf-8');
    } catch (error) {
      logger.error('Failed to save tags', { error });
      throw new Error('Failed to save tags');
    }
  }

  /**
   * 新しいタグを作成
   */
  async createTag(name: string, tag: Tag): Promise<Tag> {
    try {
      const tags = await this.getAllTags();
      
      if (tags[name]) {
        throw new Error(`Tag "${name}" already exists`);
      }
      
      tags[name] = tag;
      await this.saveTags(tags);
      
      return tag;
    } catch (error) {
      logger.error('Failed to create tag', { error, name });
      throw error;
    }
  }

  /**
   * タグを更新
   */
  async updateTag(name: string, tag: Tag): Promise<Tag | null> {
    try {
      const tags = await this.getAllTags();
      
      if (!tags[name]) {
        return null;
      }
      
      tags[name] = tag;
      await this.saveTags(tags);
      
      return tag;
    } catch (error) {
      logger.error('Failed to update tag', { error, name });
      throw error;
    }
  }

  /**
   * タグを削除
   */
  async deleteTag(name: string): Promise<boolean> {
    try {
      const tags = await this.getAllTags();
      
      if (!tags[name]) {
        return false;
      }
      
      delete tags[name];
      await this.saveTags(tags);
      
      return true;
    } catch (error) {
      logger.error('Failed to delete tag', { error, name });
      throw error;
    }
  }

  /**
   * タグの使用状況を取得
   */
  async getTagUsage(): Promise<Record<string, number>> {
    try {
      if (!this.taskService) {
        throw new Error('TaskService is not available');
      }
      
      const tasks = await this.taskService.getAllTasks();
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
      logger.error('Failed to get tag usage', { error });
      throw error;
    }
  }
}
