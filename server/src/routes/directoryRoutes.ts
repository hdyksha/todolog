import express from 'express';
import { DirectoryController } from '../controllers/directoryController.js';
import { FileService } from '../services/fileService.js';
import { SettingsService } from '../services/settingsService.js';
import { cacheControl } from '../middleware/cache.js';

const router = express.Router();
const settingsService = new SettingsService();
const fileService = new FileService(undefined, settingsService);
const directoryController = new DirectoryController(fileService);

// 利用可能なディレクトリ一覧の取得
router.get('/directories', cacheControl(60), (req, res) => directoryController.listDirectories(req, res));

export default router;
