import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';

/**
 * カテゴリ関連のルーターを作成する
 * @param categoryController カテゴリコントローラー
 * @returns Expressルーター
 */
export function createCategoryRouter(categoryController: CategoryController): Router {
  const router = Router();

  // カテゴリ一覧の取得
  router.get('/', (req, res) => categoryController.getCategories(req, res));

  return router;
}
