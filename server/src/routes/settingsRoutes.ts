import express from 'express';
import { SettingsController } from '../controllers/settingsController.js';
import { getSettingsService } from '../services/serviceContainer.js';

/**
 * 設定関連のルートを作成する
 */
export function createSettingsRoutes() {
  const router = express.Router();
  
  // サービスの取得
  const settingsService = getSettingsService();
  
  // コントローラーの作成
  const settingsController = new SettingsController(settingsService);

  // 設定の取得
  router.get('/', (req, res) => settingsController.getSettings(req, res));

  // 設定の更新
  router.put('/', (req, res) => settingsController.updateSettings(req, res));

  // 設定のリセット
  router.post('/reset', (req, res) => settingsController.resetSettings(req, res));

  // データディレクトリの設定
  router.put('/storage/data-dir', (req, res) => settingsController.setDataDir(req, res));

  // 現在のタスクファイルの設定
  router.put('/storage/current-file', (req, res) => settingsController.setCurrentTaskFile(req, res));

  // 最近使用したタスクファイルの取得
  router.get('/storage/recent-files', (req, res) => settingsController.getRecentTaskFiles(req, res));

  return router;
}
