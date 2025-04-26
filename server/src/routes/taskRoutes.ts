import express from 'express';
import { TaskController } from '../controllers/taskController.js';
import { getTaskService, getTagService } from '../services/serviceContainer.js';
import { cacheControl, noCacheAfterMutation } from '../middleware/cache.js';

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
  router.get('/', cacheControl(5), taskController.getAllTasks);
  router.get('/:id', cacheControl(5), taskController.getTaskById);
  router.post('/', noCacheAfterMutation, taskController.createTask);
  router.put('/:id', noCacheAfterMutation, taskController.updateTask);
  router.delete('/:id', noCacheAfterMutation, taskController.deleteTask);
  router.put('/:id/toggle', noCacheAfterMutation, taskController.toggleTaskCompletion);
  router.put('/:id/memo', noCacheAfterMutation, taskController.updateTaskMemo);

  // バックアップと復元のエンドポイント
  router.post('/backups', taskController.createBackup);
  router.get('/backups', cacheControl(60), taskController.listBackups);
  router.post('/backups/:filename/restore', noCacheAfterMutation, taskController.restoreFromBackup);

  // エクスポート/インポートのエンドポイント
  router.get('/export', taskController.exportTasks);
  router.post('/import', noCacheAfterMutation, taskController.importTasks);

  return router;
}
