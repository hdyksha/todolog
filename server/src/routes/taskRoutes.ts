import express from 'express';
import { TaskController } from '../controllers/taskController.js';
import { TaskService } from '../services/taskService.js';
import { FileService } from '../services/fileService.js';
import { cacheControl, noCacheAfterMutation } from '../middleware/cache.js';

// サービスのインスタンス化
const fileService = new FileService();
const taskService = new TaskService(fileService);
const taskController = new TaskController(taskService);

// ルーターの作成
export const taskRoutes = express.Router();

// タスク関連のエンドポイント
taskRoutes.get('/tasks', cacheControl(5), taskController.getAllTasks);
taskRoutes.get('/tasks/:id', cacheControl(5), taskController.getTaskById);
taskRoutes.post('/tasks', noCacheAfterMutation, taskController.createTask);
taskRoutes.put('/tasks/:id', noCacheAfterMutation, taskController.updateTask);
taskRoutes.delete('/tasks/:id', noCacheAfterMutation, taskController.deleteTask);
taskRoutes.put('/tasks/:id/toggle', noCacheAfterMutation, taskController.toggleTaskCompletion);
taskRoutes.put('/tasks/:id/memo', noCacheAfterMutation, taskController.updateTaskMemo);
taskRoutes.get('/categories', cacheControl(60), taskController.getCategories);

// バックアップと復元のエンドポイント
taskRoutes.post('/backups', taskController.createBackup);
taskRoutes.get('/backups', cacheControl(60), taskController.listBackups);
taskRoutes.post('/backups/:filename/restore', noCacheAfterMutation, taskController.restoreFromBackup);

// エクスポート/インポートのエンドポイント
taskRoutes.get('/export', taskController.exportTasks);
taskRoutes.post('/import', noCacheAfterMutation, taskController.importTasks);
