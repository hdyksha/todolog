import { Request, Response } from 'express';
import { TaskService } from '../services/taskService.js';
import { Priority } from '../types/index.js';

/**
 * タスク関連のAPIエンドポイントを処理するコントローラークラス
 */
export class TaskController {
  private taskService: TaskService;

  /**
   * コンストラクタ
   * @param taskService タスクサービス
   */
  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  /**
   * タスク一覧を取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.taskService.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error('タスク一覧の取得に失敗しました:', error);
      res.status(500).json({ error: 'タスク一覧の取得に失敗しました' });
    }
  }

  /**
   * 特定のタスクを取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      console.error('タスクの取得に失敗しました:', error);
      res.status(500).json({ error: 'タスクの取得に失敗しました' });
    }
  }

  /**
   * 新しいタスクを作成する
   * @param req リクエスト
   * @param res レスポンス
   */
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { title, priority, category, dueDate, memo } = req.body;
      
      if (!title || typeof title !== 'string') {
        res.status(400).json({ error: 'タイトルは必須です' });
        return;
      }
      
      const task = await this.taskService.createTask({
        title,
        priority: priority as Priority,
        category,
        dueDate,
        memo,
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error('タスクの作成に失敗しました:', error);
      res.status(500).json({ error: 'タスクの作成に失敗しました' });
    }
  }

  /**
   * タスクを更新する
   * @param req リクエスト
   * @param res レスポンス
   */
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, completed, priority, category, dueDate, memo } = req.body;
      
      const updatedTask = await this.taskService.updateTask(id, {
        title,
        completed,
        priority,
        category,
        dueDate,
        memo,
      });
      
      if (!updatedTask) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error('タスクの更新に失敗しました:', error);
      res.status(500).json({ error: 'タスクの更新に失敗しました' });
    }
  }

  /**
   * タスクを削除する
   * @param req リクエスト
   * @param res レスポンス
   */
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.taskService.deleteTask(id);
      
      if (!success) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }
      
      res.json({ message: 'タスクが削除されました' });
    } catch (error) {
      console.error('タスクの削除に失敗しました:', error);
      res.status(500).json({ error: 'タスクの削除に失敗しました' });
    }
  }

  /**
   * タスクの完了状態を切り替える
   * @param req リクエスト
   * @param res レスポンス
   */
  async toggleTaskCompletion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      
      const updatedTask = await this.taskService.toggleTaskCompletion(id, completed);
      
      if (!updatedTask) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error('タスクの完了状態の切り替えに失敗しました:', error);
      res.status(500).json({ error: 'タスクの完了状態の切り替えに失敗しました' });
    }
  }

  /**
   * タスクのメモを更新する
   * @param req リクエスト
   * @param res レスポンス
   */
  async updateTaskMemo(req: Request, res: Response): Promise<void> {
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
      
      res.json(updatedTask);
    } catch (error) {
      console.error('メモの更新に失敗しました:', error);
      res.status(500).json({ error: 'メモの更新に失敗しました' });
    }
  }
}
