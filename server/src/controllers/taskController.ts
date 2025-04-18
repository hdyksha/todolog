import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
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
      const tasks = await this.taskService.getAllTasks();
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
  
  // カテゴリ一覧の取得
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.taskService.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };
}
