import express from 'express';
import { DirectoryController } from '../controllers/directoryController.js';
import { getFileService } from '../services/serviceContainer.js';
import { cacheControl } from '../middleware/cache.js';

/**
 * ディレクトリ関連のルートを作成する
 */
export function createDirectoryRoutes() {
  const router = express.Router();
  
  // サービスの取得
  const fileService = getFileService();
  
  // コントローラーの作成
  const directoryController = new DirectoryController(fileService);

  // 利用可能なディレクトリ一覧の取得
  router.get('/directories', cacheControl(60), (req, res) => directoryController.listDirectories(req, res));

  return router;
}
