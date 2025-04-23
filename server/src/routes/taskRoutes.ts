import express from 'express';
import { TaskController } from '../controllers/taskController.js';
import { TaskService } from '../services/taskService.js';
import { FileService } from '../services/fileService.js';
import { SettingsService } from '../services/settingsService.js';
import { cacheControl, noCacheAfterMutation } from '../middleware/cache.js';

// サービスのインスタンス化
const settingsService = new SettingsService();
const fileService = new FileService(undefined, settingsService);
const taskService = new TaskService(fileService, settingsService);
const taskController = new TaskController(taskService);

// ルーターの作成
export const taskRoutes = express.Router();

// タスク関連のエンドポイント
taskRoutes.get('/', cacheControl(5), taskController.getAllTasks);
taskRoutes.get('/:id', cacheControl(5), taskController.getTaskById);
taskRoutes.post('/', noCacheAfterMutation, taskController.createTask);
taskRoutes.put('/:id', noCacheAfterMutation, taskController.updateTask);
taskRoutes.delete('/:id', noCacheAfterMutation, taskController.deleteTask);
taskRoutes.put('/:id/toggle', noCacheAfterMutation, taskController.toggleTaskCompletion);
taskRoutes.put('/:id/memo', noCacheAfterMutation, taskController.updateTaskMemo);

// バックアップと復元のエンドポイント
taskRoutes.post('/backups', taskController.createBackup);
taskRoutes.get('/backups', cacheControl(60), taskController.listBackups);
taskRoutes.post('/backups/:filename/restore', noCacheAfterMutation, taskController.restoreFromBackup);

// エクスポート/インポートのエンドポイント
taskRoutes.get('/export', taskController.exportTasks);
taskRoutes.post('/import', noCacheAfterMutation, taskController.importTasks);
