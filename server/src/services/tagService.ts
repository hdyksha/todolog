import { FileService } from './fileService.js';
import { Tag, CreateTagInput, UpdateTagInput } from '../models/tag.model.js';
import { logger } from '../utils/logger.js';

export class TagService {
  private fileService: FileService;
  private readonly TAGS_FILE = 'tags.json';

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  /**
   * すべてのタグを取得する
   * @returns タグのオブジェクト
   */
  async getAllTags(): Promise<Record<string, Tag>> {
    logger.info(`タグを読み込み中: ${this.TAGS_FILE}`);
    return await this.fileService.readFile<Record<string, Tag>>(this.TAGS_FILE, {});
  }

  /**
   * 特定のタグを取得する
   * @param name タグ名
   * @returns タグ情報、存在しない場合はnull
   */
  async getTagByName(name: string): Promise<Tag | null> {
    const tags = await this.getAllTags();
    return tags[name] || null;
  }

  /**
   * 新しいタグを作成する
   * @param name タグ名
   * @param tagData タグデータ
   * @returns 作成されたタグ
   */
  async createTag(name: string, tagData: CreateTagInput): Promise<Tag> {
    const tags = await this.getAllTags();
    
    if (tags[name]) {
      logger.info(`タグ "${name}" は既に存在します`);
      return tags[name];
    }
    
    const newTag: Tag = {
      name,
      color: tagData.color,
      description: tagData.description
    };
    
    tags[name] = newTag;
    
    await this.fileService.writeFile(this.TAGS_FILE, tags);
    logger.info(`タグを作成しました: ${name}`);
    
    return newTag;
  }

  /**
   * タグを更新する
   * @param name タグ名
   * @param tagData 更新するタグデータ
   * @returns 更新されたタグ
   */
  async updateTag(name: string, tagData: UpdateTagInput): Promise<Tag> {
    const tags = await this.getAllTags();
    
    if (!tags[name]) {
      throw new Error(`タグ "${name}" が見つかりません`);
    }
    
    const updatedTag: Tag = {
      ...tags[name],
      ...tagData
    };
    
    tags[name] = updatedTag;
    
    await this.fileService.writeFile(this.TAGS_FILE, tags);
    logger.info(`タグを更新しました: ${name}`);
    
    return updatedTag;
  }

  /**
   * タグを削除する
   * @param name タグ名
   * @returns 削除が成功したかどうか
   */
  async deleteTag(name: string): Promise<boolean> {
    const tags = await this.getAllTags();
    
    if (!tags[name]) {
      throw new Error(`タグ "${name}" が見つかりません`);
    }
    
    delete tags[name];
    
    await this.fileService.writeFile(this.TAGS_FILE, tags);
    logger.info(`タグを削除しました: ${name}`);
    
    return true;
  }

  /**
   * タグの使用状況を取得する
   * @param taskService タスクサービス
   * @returns タグごとの使用回数
   */
  async getTagUsage(taskService: any): Promise<Record<string, number>> {
    const tags = await this.getAllTags();
    const tasks = await taskService.getAllTasks();
    
    const usage: Record<string, number> = {};
    
    // 初期化
    Object.keys(tags).forEach(tagName => {
      usage[tagName] = 0;
    });
    
    // 使用回数をカウント
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => {
          if (usage[tag] !== undefined) {
            usage[tag]++;
          }
        });
      }
    });
    
    return usage;
  }

  /**
   * 未使用のタグを削除する
   * @param taskService タスクサービス
   * @returns 削除されたタグ名の配列
   */
  async cleanupUnusedTags(taskService: any): Promise<string[]> {
    const usage = await this.getTagUsage(taskService);
    const unusedTags = Object.keys(usage).filter(tag => usage[tag] === 0);
    
    const tags = await this.getAllTags();
    let deleted: string[] = [];
    
    for (const tag of unusedTags) {
      if (tags[tag]) {
        delete tags[tag];
        deleted.push(tag);
      }
    }
    
    if (deleted.length > 0) {
      await this.fileService.writeFile(this.TAGS_FILE, tags);
      logger.info(`未使用のタグを削除しました: ${deleted.join(', ')}`);
    }
    
    return deleted;
  }
}
