import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService.js';
import { CreateTaskSchema, UpdateTaskSchema } from '../models/task.model.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  // タスク一覧の取得
  getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // クエリパラメータの取得
      const { category, completed, priority, sortBy, sortOrder } = req.query;
      
      // フィルタリングとソートのオプション
      const options: {
        category?: string;
        completed?: boolean;
        priority?: string;
        sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
        sortOrder?: 'asc' | 'desc';
      } = {};
      
      // クエリパラメータの処理
      if (category && typeof category === 'string') {
        options.category = category;
      }
      
      if (completed !== undefined) {
        options.completed = completed === 'true';
      }
      
      if (priority && typeof priority === 'string') {
        options.priority = priority;
      }
      
      if (sortBy && typeof sortBy === 'string' && 
          ['createdAt', 'updatedAt', 'dueDate', 'priority'].includes(sortBy)) {
        options.sortBy = sortBy as 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
      }
      
      if (sortOrder && typeof sortOrder === 'string' && 
          ['asc', 'desc'].includes(sortOrder)) {
        options.sortOrder = sortOrder as 'asc' | 'desc';
      }
      
      const tasks = await this.taskService.getAllTasks(options);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  // 特定のタスクの取得
  getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);

      if (!task) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  // タスクの作成
  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // リクエストボディのバリデーション
      const taskData = CreateTaskSchema.parse(req.body);
      
      const newTask = await this.taskService.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'バリデーションエラー', 
          details: error.errors 
        });
        return;
      }
      next(error);
    }
  };

  // タスクの更新
  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      // リクエストボディのバリデーション
      const taskData = UpdateTaskSchema.parse(req.body);
      
      const updatedTask = await this.taskService.updateTask(id, taskData);

      if (!updatedTask) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'バリデーションエラー', 
          details: error.errors 
        });
        return;
      }
      next(error);
    }
  };

  // タスクの削除
  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.taskService.deleteTask(id);

      if (!result) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
  
  // タスクの完了状態を切り替え
  toggleTaskCompletion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedTask = await this.taskService.toggleTaskCompletion(id);

      if (!updatedTask) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      next(error);
    }
  };
  
  // タスクのメモ更新
  updateTaskMemo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { memo } = req.body;
      
      if (typeof memo !== 'string') {
        res.status(400).json({ error: 'メモは文字列である必要があります' });
        return;
      }
      
      const updatedTask = await this.taskService.updateTaskMemo(id, memo);

      if (!updatedTask) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      next(error);
    }
  };
  
  // カテゴリ一覧の取得
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.taskService.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };
  
  // データのバックアップを作成
  createBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backupFilename = await this.taskService.createBackup();
      res.status(200).json({ 
        message: 'バックアップが作成されました',
        backupFilename 
      });
    } catch (error) {
      next(error);
    }
  };
  
  // バックアップからデータを復元
  restoreFromBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;
      
      await this.taskService.restoreFromBackup(filename);
      res.status(200).json({ 
        message: 'バックアップから復元しました',
        restoredFrom: filename 
      });
    } catch (error) {
      if ((error as Error).message.includes('存在しません')) {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      next(error);
    }
  };
  
  // 利用可能なバックアップ一覧を取得
  listBackups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backups = await this.taskService.listBackups();
      res.status(200).json(backups);
    } catch (error) {
      next(error);
    }
  };
  
  // タスクデータをエクスポート
  exportTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.exportTasks();
      
      // Content-Dispositionヘッダーを設定してダウンロードを促す
      const filename = `todolog-export-${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };
  
  // タスクデータをインポート
  importTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = req.body;
      
      // 配列であることを確認
      if (!Array.isArray(tasks)) {
        res.status(400).json({ error: 'タスクデータは配列である必要があります' });
        return;
      }
      
      // 各タスクの基本的な検証
      for (const task of tasks) {
        if (!task.id || !task.title || task.completed === undefined) {
          res.status(400).json({ 
            error: 'タスクデータの形式が不正です',
            invalidTask: task 
          });
          return;
        }
      }
      
      await this.taskService.importTasks(tasks);
      res.status(200).json({ 
        message: 'タスクデータをインポートしました',
        count: tasks.length 
      });
    } catch (error) {
      next(error);
    }
  };
}
