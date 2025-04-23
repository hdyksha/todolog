import express from 'express';
import { TagService } from '../services/tagService.js';
import { TaskService } from '../services/taskService.js';
import { CreateTagSchema, UpdateTagSchema } from '../models/tag.model.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { logger } from '../utils/logger.js';

export const createTagRouter = (
  tagService: TagService,
  taskService: TaskService
) => {
  const router = express.Router();

  // すべてのタグを取得
  router.get('/', async (req, res) => {
    try {
      const tags = await tagService.getAllTags();
      res.json(tags);
    } catch (error) {
      logger.error('タグの取得に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: 'タグの取得に失敗しました' });
    }
  });

  // タグの使用状況を取得
  router.get('/usage', async (req, res) => {
    try {
      const usage = await tagService.getTagUsage(taskService);
      res.json(usage);
    } catch (error) {
      logger.error('タグの使用状況の取得に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: 'タグの使用状況の取得に失敗しました' });
    }
  });

  // 特定のタグを取得
  router.get('/:name', async (req, res) => {
    try {
      const tag = await tagService.getTagByName(req.params.name);
      if (!tag) {
        return res.status(404).json({ error: 'タグが見つかりません' });
      }
      res.json(tag);
    } catch (error) {
      logger.error('タグの取得に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: 'タグの取得に失敗しました' });
    }
  });

  // 新しいタグを作成
  router.post(
    '/:name',
    validateRequest({ body: CreateTagSchema }),
    async (req, res) => {
      try {
        const tag = await tagService.createTag(req.params.name, req.body);
        res.status(201).json(tag);
      } catch (error) {
        if ((error as Error).message.includes('既に存在します')) {
          return res.status(409).json({ error: (error as Error).message });
        }
        logger.error('タグの作成に失敗しました', { error: (error as Error).message });
        res.status(500).json({ error: 'タグの作成に失敗しました' });
      }
    }
  );

  // タグを更新
  router.put(
    '/:name',
    validateRequest({ body: UpdateTagSchema }),
    async (req, res) => {
      try {
        const tag = await tagService.updateTag(req.params.name, req.body);
        res.json(tag);
      } catch (error) {
        if ((error as Error).message.includes('見つかりません')) {
          return res.status(404).json({ error: (error as Error).message });
        }
        logger.error('タグの更新に失敗しました', { error: (error as Error).message });
        res.status(500).json({ error: 'タグの更新に失敗しました' });
      }
    }
  );

  // タグを削除
  router.delete('/:name', async (req, res) => {
    try {
      await tagService.deleteTag(req.params.name);
      res.status(204).end();
    } catch (error) {
      if ((error as Error).message.includes('見つかりません')) {
        return res.status(404).json({ error: (error as Error).message });
      }
      logger.error('タグの削除に失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: 'タグの削除に失敗しました' });
    }
  });

  // 未使用のタグをクリーンアップ
  router.post('/cleanup', async (req, res) => {
    try {
      const deletedTags = await tagService.cleanupUnusedTags(taskService);
      res.json({ deletedTags });
    } catch (error) {
      logger.error('未使用タグのクリーンアップに失敗しました', { error: (error as Error).message });
      res.status(500).json({ error: '未使用タグのクリーンアップに失敗しました' });
    }
  });

  return router;
};
