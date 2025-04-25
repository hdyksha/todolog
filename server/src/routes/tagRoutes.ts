import express from 'express';
import { TagController } from '../controllers/tagController.js';
import { TagService } from '../services/tagService.js';
import { TaskService } from '../services/taskService.js';
import { FileService } from '../services/fileService.js';
import { env } from '../config/env.js';

// サービスのインスタンスを作成
const fileService = new FileService(env.DATA_DIR);
const tagService = new TagService();
const taskService = new TaskService(fileService, undefined, tagService);

// 循環参照を解決するために、TagServiceにTaskServiceを設定
tagService.setTaskService(taskService);

// コントローラーのインスタンスを作成
const tagController = new TagController(tagService, taskService);

const router = express.Router();

// タグ関連のルート
router.get('/', tagController.getAllTags);
router.get('/usage', tagController.getTagUsage);
router.post('/:name', tagController.createTag);
router.put('/:name', tagController.updateTag);
router.delete('/:name', tagController.deleteTag);

export default router;
