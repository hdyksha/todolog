import express from 'express';
import { TagController } from '../controllers/tagController.js';
import { getTagService, getTaskService } from '../services/serviceContainer.js';

/**
 * タグ関連のルートを作成する
 */
export function createTagRoutes() {
  const router = express.Router();
  
  // サービスの取得
  const tagService = getTagService();
  const taskService = getTaskService();
  
  // コントローラーの作成
  const tagController = new TagController(tagService, taskService);

  // タグ関連のルート
  router.get('/', tagController.getAllTags);
  router.get('/usage', tagController.getTagUsage);
  router.post('/:name', tagController.createTag);
  router.put('/:name', tagController.updateTag);
  router.delete('/:name', tagController.deleteTag);

  return router;
}
