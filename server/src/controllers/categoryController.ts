import { Request, Response } from 'express';
import { TaskService } from '../services/taskService.js';

/**
 * カテゴリ関連のAPIエンドポイントを処理するコントローラークラス
 */
export class CategoryController {
  private taskService: TaskService;

  /**
   * コンストラクタ
   * @param taskService タスクサービス
   */
  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  /**
   * カテゴリ一覧を取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.taskService.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('カテゴリ一覧の取得に失敗しました:', error);
      res.status(500).json({ error: 'カテゴリ一覧の取得に失敗しました' });
    }
  }
}
