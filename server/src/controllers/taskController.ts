import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService.js';
import { CreateTaskSchema, UpdateTaskSchema, TaskFilterSchema, MemoUpdateSchema } from '../models/task.model.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import { BadRequestError, NotFoundError, ValidationError } from '../utils/error.js';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  // タスク一覧の取得
  getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // クエリパラメータの取得と検証
      const filterResult = TaskFilterSchema.safeParse(req.query);
      
      if (!filterResult.success) {
        next(new ValidationError(filterResult.error));
        return;
      }
      
      const options = filterResult.data;
      const tasks = await this.taskService.getAllTasks(options);
      
      // キャッシュヘッダーの設定
      res.setHeader('Cache-Control', 'private, max-age=10');
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
        next(new NotFoundError(`ID: ${id} のタスクが見つかりません`));
        return;
      }

      // キャッシュヘッダーの設定
      res.setHeader('Cache-Control', 'private, max-age=30');
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
        next(new ValidationError(error));
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
        next(new NotFoundError(`ID: ${id} のタスクが見つかりません`));
        return;
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error));
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
        next(new NotFoundError(`ID: ${id} のタスクが見つかりません`));
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
        next(new NotFoundError(`ID: ${id} のタスクが見つかりません`));
        return;
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      next(error);
    }
  };

  // タスクのメモを更新
  updateTaskMemo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      // リクエストボディのバリデーション
      const memoData = MemoUpdateSchema.parse(req.body);
      
      const updatedTask = await this.taskService.updateTaskMemo(id, memoData.memo);

      if (!updatedTask) {
        next(new NotFoundError(`ID: ${id} のタスクが見つかりません`));
        return;
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error));
        return;
      }
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

  // バックアップの作成
  createBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backupFile = await this.taskService.createBackup();
      res.status(201).json({ filename: backupFile });
    } catch (error) {
      next(error);
    }
  };

  // バックアップ一覧の取得
  listBackups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backups = await this.taskService.listBackups();
      res.status(200).json(backups);
    } catch (error) {
      next(error);
    }
  };

  // バックアップからの復元
  restoreFromBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;
      await this.taskService.restoreFromBackup(filename);
      res.status(200).json({ message: 'バックアップから復元しました' });
    } catch (error) {
      next(error);
    }
  };

  // タスクデータのエクスポート
  exportTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.getAllTasks({});
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  // タスクデータのインポート
  importTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = req.body;
      
      if (!Array.isArray(tasks)) {
        next(new BadRequestError('タスクデータは配列形式である必要があります'));
        return;
      }
      
      await this.taskService.importTasks(tasks);
      res.status(200).json({ message: 'タスクデータをインポートしました' });
    } catch (error) {
      next(error);
    }
  };
}
