import express from 'express';
import { StorageController } from '../controllers/storageController.js';
import { getFileService, getSettingsService } from '../services/serviceContainer.js';
import { cacheControl, noCacheAfterMutation } from '../middleware/cache.js';

/**
 * ストレージ関連のルートを作成する
 */
export function createStorageRoutes() {
  const router = express.Router();
  
  // サービスの取得
  const fileService = getFileService();
  const settingsService = getSettingsService();
  
  // コントローラーの作成
  const storageController = new StorageController(fileService, settingsService);

  // ファイル一覧の取得
  router.get('/files', cacheControl(5), (req, res) => storageController.listFiles(req, res));

  // 新しいタスクファイルの作成
  router.post('/files', noCacheAfterMutation, (req, res) => storageController.createTaskFile(req, res));

  return router;
}
