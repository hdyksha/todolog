import express from 'express';
import { TaskController } from '../controllers/taskController.js';
import { getTaskService, getTagService } from '../services/serviceContainer.js';
import { cacheControl, noCacheAfterMutation } from '../middleware/cache.js';
import { asyncHandler } from '../utils/errorUtils.js';

/**
 * タスク関連のルートを作成する
 */
export function createTaskRoutes() {
  const router = express.Router();
  
  // サービスの取得
  const taskService = getTaskService();
  const tagService = getTagService();
  
  // コントローラーの作成
  const taskController = new TaskController(taskService);

  // タスク関連のエンドポイント
  router.get('/', cacheControl(5), asyncHandler(taskController.getAllTasks));
  router.get('/:id', cacheControl(5), asyncHandler(taskController.getTaskById));
  router.post('/', noCacheAfterMutation, asyncHandler(taskController.createTask));
  router.put('/:id', noCacheAfterMutation, asyncHandler(taskController.updateTask));
  router.delete('/:id', noCacheAfterMutation, asyncHandler(taskController.deleteTask));
  router.put('/:id/toggle', noCacheAfterMutation, asyncHandler(taskController.toggleTaskCompletion));
  router.put('/:id/memo', noCacheAfterMutation, asyncHandler(taskController.updateTaskMemo));

  // バックアップと復元のエンドポイント - 共通パスプレフィックスを使用
  router.post('/backups', asyncHandler(taskController.createBackup));
  router.get('/backups', cacheControl(60), asyncHandler(taskController.listBackups));
  router.post('/backups/:filename/restore', noCacheAfterMutation, asyncHandler(taskController.restoreFromBackup));

  // エクスポート/インポートのエンドポイント
  router.get('/export', asyncHandler(taskController.exportTasks));
  router.post('/import', noCacheAfterMutation, asyncHandler(taskController.importTasks));

  return router;
}
