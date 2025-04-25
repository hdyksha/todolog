import { Request, Response } from 'express';
import { TagService } from '../services/tagService.js';
import { TaskService } from '../services/taskService.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

// タグスキーマ
const tagSchema = z.object({
  color: z.string(),
  description: z.string().optional()
});

// コントローラーのインスタンスを作成
export class TagController {
  private tagService: TagService;
  private taskService: TaskService;

  constructor(tagService: TagService, taskService: TaskService) {
    this.tagService = tagService;
    this.taskService = taskService;
  }

  /**
   * すべてのタグを取得
   */
  getAllTags = async (req: Request, res: Response) => {
    try {
      const tags = await this.tagService.getAllTags();
      res.json(tags);
    } catch (error) {
      logger.error('Failed to get all tags', { error });
      res.status(500).json({ error: 'Failed to get tags' });
    }
  }

  /**
   * 新しいタグを作成
   */
  createTag = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      
      if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      // リクエストボディのバリデーション
      const validationResult = tagSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid tag data', 
          details: validationResult.error.format() 
        });
      }

      const tagData = validationResult.data;
      const tag = await this.tagService.createTag(name, tagData);
      
      res.status(201).json(tag);
    } catch (error) {
      logger.error('Failed to create tag', { error });
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }

  /**
   * タグを更新
   */
  updateTag = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      
      if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      // リクエストボディのバリデーション
      const validationResult = tagSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid tag data', 
          details: validationResult.error.format() 
        });
      }

      const tagData = validationResult.data;
      const tag = await this.tagService.updateTag(name, tagData);
      
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      
      res.json(tag);
    } catch (error) {
      logger.error('Failed to update tag', { error });
      res.status(500).json({ error: 'Failed to update tag' });
    }
  }

  /**
   * タグを削除
   */
  deleteTag = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      
      if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      // タグが使用されているかチェック
      const tasks = await this.taskService.getTasksByTag(name);
      if (tasks.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete tag that is in use',
          tasksCount: tasks.length
        });
      }

      const success = await this.tagService.deleteTag(name);
      
      if (!success) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      logger.error('Failed to delete tag', { error });
      res.status(500).json({ error: 'Failed to delete tag' });
    }
  }

  /**
   * タグの使用状況を取得
   */
  getTagUsage = async (req: Request, res: Response) => {
    try {
      const usage = await this.tagService.getTagUsage();
      res.json(usage);
    } catch (error) {
      logger.error('Failed to get tag usage', { error });
      res.status(500).json({ error: 'Failed to get tag usage' });
    }
  }
}
