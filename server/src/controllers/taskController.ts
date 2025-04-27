import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService.js';
import { CreateTaskSchema, UpdateTaskSchema, TaskFilterSchema, MemoUpdateSchema } from '../models/task.model.js';
import { z } from 'zod';
import { BadRequestError, NotFoundError, ValidationError } from '../utils/error.js';
import { updateTaskDataTimestamp } from '../middleware/cache.js';
import { handleApiError } from '../utils/errorUtils.js';

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
      
      // 一覧表示用に必要なフィールドのみを含むタスクリストを返す
      const simplifiedTasks = tasks.map(({ id, title, completed, priority, tags, dueDate, createdAt, updatedAt }) => ({
        id,
        title,
        completed,
        priority,
        tags,
        dueDate,
        createdAt,
        updatedAt,
        // メモは一覧表示時には不要なので含めない
      }));
      
      // キャッシュヘッダーの設定
      res.setHeader('Cache-Control', 'private, max-age=10');
      res.status(200).json(simplifiedTasks);
    } catch (error) {
      handleApiError(error, res, 'タスク一覧の取得');
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
      handleApiError(error, res, 'タスクの取得');
    }
  };

  // タスクの作成
  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // リクエストボディのバリデーション
      const taskData = CreateTaskSchema.parse(req.body);
      
      const newTask = await this.taskService.createTask(taskData);
      
      // タスクデータのタイムスタンプを更新
      updateTaskDataTimestamp();
      
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error));
        return;
      }
      handleApiError(error, res, 'タスクの作成');
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

      // タスクデータのタイムスタンプを更新
      updateTaskDataTimestamp();
      
      res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error));
        return;
      }
      handleApiError(error, res, 'タスクの更新');
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

      // タスクデータのタイムスタンプを更新
      updateTaskDataTimestamp();
      
      res.status(204).end();
    } catch (error) {
      handleApiError(error, res, 'タスクの削除');
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

      // タスクデータのタイムスタンプを更新
      updateTaskDataTimestamp();
      
      res.status(200).json(updatedTask);
    } catch (error) {
      handleApiError(error, res, 'タスクの完了状態の切り替え');
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

      // タスクデータのタイムスタンプを更新
      updateTaskDataTimestamp();
      
      res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error));
        return;
      }
      handleApiError(error, res, 'タスクのメモ更新');
    }
  };

  // タグ一覧の取得
  getTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tags = await this.taskService.getTags();
      res.status(200).json(tags);
    } catch (error) {
      handleApiError(error, res, 'タグ一覧の取得');
    }
  };

  // バックアップの作成
  createBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backupFile = await this.taskService.createBackup();
      res.status(201).json({ filename: backupFile });
    } catch (error) {
      handleApiError(error, res, 'バックアップの作成');
    }
  };

  // バックアップ一覧の取得
  listBackups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backups = await this.taskService.listBackups();
      res.status(200).json(backups);
    } catch (error) {
      handleApiError(error, res, 'バックアップ一覧の取得');
    }
  };

  // バックアップからの復元
  restoreFromBackup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;
      await this.taskService.restoreFromBackup(filename);
      
      // タスクデータのタイムスタンプを更新
      updateTaskDataTimestamp();
      
      res.status(200).json({ message: 'バックアップから復元しました' });
    } catch (error) {
      handleApiError(error, res, 'バックアップからの復元');
    }
  };

  // タスクデータのエクスポート
  exportTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.getAllTasks({});
      res.status(200).json(tasks);
    } catch (error) {
      handleApiError(error, res, 'タスクデータのエクスポート');
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
      
      // タスクデータのタイムスタンプを更新
      updateTaskDataTimestamp();
      
      res.status(200).json({ message: 'タスクデータをインポートしました' });
    } catch (error) {
      handleApiError(error, res, 'タスクデータのインポート');
    }
  };
}
