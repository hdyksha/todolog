import express from 'express';
import { StorageController } from '../controllers/storageController.js';
import { FileService } from '../services/fileService.js';
import { SettingsService } from '../services/settingsService.js';
import { cacheControl, noCacheAfterMutation } from '../middleware/cache.js';

const router = express.Router();
const settingsService = new SettingsService();
const fileService = new FileService(undefined, settingsService);
const storageController = new StorageController(fileService, settingsService);

// ファイル一覧の取得
router.get('/files', cacheControl(5), (req, res) => storageController.listFiles(req, res));

// 新しいタスクファイルの作成
router.post('/files', noCacheAfterMutation, (req, res) => storageController.createTaskFile(req, res));

export default router;
