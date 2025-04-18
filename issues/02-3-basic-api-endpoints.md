# フェーズ3: APIエンドポイントの実装（基本機能）

## 目標

タスク管理の基本的なCRUD操作を行うAPIエンドポイントを実装します。

## タスク

### 3.1 コントローラーの実装 ⬜

- タスクコントローラーの実装
- リクエスト検証の実装
- レスポンス形式の標準化

### 3.2 ルーターの実装 ⬜

- タスクルーターの実装
- エンドポイントの定義
- ミドルウェアの適用

### 3.3 タスク一覧の取得 API ⬜

- GETリクエストの処理
- クエリパラメータの処理
- ページネーションの実装

### 3.4 タスク詳細の取得 API ⬜

- 特定のタスクを取得するエンドポイント
- 存在しないタスクのエラーハンドリング

### 3.5 タスク作成 API ⬜

- POSTリクエストの処理
- 入力バリデーション
- 作成成功時のレスポンス

### 3.6 タスク更新 API ⬜

- PUTリクエストの処理
- 部分更新の処理
- 更新成功時のレスポンス

### 3.7 タスク削除 API ⬜

- DELETEリクエストの処理
- 削除成功時のレスポンス

## 実装詳細

### 3.1 コントローラーの実装

```typescript
// src/controllers/task.controller.ts
import { Request, Response } from 'express';
import { TaskService } from '../services/task.service.js';
import { CreateTaskSchema, UpdateTaskSchema } from '../models/task.model.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  // 標準レスポンス形式
  private sendResponse(res: Response, status: number, data: any, message?: string) {
    const response: any = { data };
    if (message) {
      response.message = message;
    }
    return res.status(status).json(response);
  }

  // エラーレスポンス形式
  private sendError(res: Response, status: number, message: string, errors?: any) {
    const response: any = { error: message };
    if (errors) {
      response.details = errors;
    }
    return res.status(status).json(response);
  }

  // バリデーションエラーの処理
  private handleValidationError(res: Response, error: z.ZodError) {
    const formattedErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    
    return this.sendError(res, 400, 'バリデーションエラー', formattedErrors);
  }

  // タスク一覧の取得
  async getAllTasks(req: Request, res: Response) {
    try {
      const tasks = await this.taskService.getAllTasks();
      return this.sendResponse(res, 200, tasks);
    } catch (error) {
      logger.error('タスク一覧の取得に失敗しました', error);
      return this.sendError(res, 500, '内部サーバーエラー');
    }
  }

  // タスク詳細の取得
  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        return this.sendError(res, 404, `ID: ${id} のタスクが見つかりません`);
      }
      
      return this.sendResponse(res, 200, task);
    } catch (error) {
      logger.error(`タスク詳細の取得に失敗しました: ${req.params.id}`, error);
      return this.sendError(res, 500, '内部サーバーエラー');
    }
  }

  // タスクの作成
  async createTask(req: Request, res: Response) {
    try {
      // リクエストボディのバリデーション
      const validationResult = CreateTaskSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return this.handleValidationError(res, validationResult.error);
      }
      
      const newTask = await this.taskService.createTask(validationResult.data);
      return this.sendResponse(res, 201, newTask, 'タスクが作成されました');
    } catch (error) {
      logger.error('タスクの作成に失敗しました', error);
      return this.sendError(res, 500, '内部サーバーエラー');
    }
  }

  // タスクの更新
  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // リクエストボディのバリデーション
      const validationResult = UpdateTaskSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return this.handleValidationError(res, validationResult.error);
      }
      
      const updatedTask = await this.taskService.updateTask(id, validationResult.data);
      
      if (!updatedTask) {
        return this.sendError(res, 404, `ID: ${id} のタスクが見つかりません`);
      }
      
      return this.sendResponse(res, 200, updatedTask, 'タスクが更新されました');
    } catch (error) {
      logger.error(`タスクの更新に失敗しました: ${req.params.id}`, error);
      return this.sendError(res, 500, '内部サーバーエラー');
    }
  }

  // タスクの削除
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.taskService.deleteTask(id);
      
      if (!result) {
        return this.sendError(res, 404, `ID: ${id} のタスクが見つかりません`);
      }
      
      return this.sendResponse(res, 200, { id }, 'タスクが削除されました');
    } catch (error) {
      logger.error(`タスクの削除に失敗しました: ${req.params.id}`, error);
      return this.sendError(res, 500, '内部サーバーエラー');
    }
  }
}
```

### 3.2 ルーターの実装

```typescript
// src/routes/task.routes.ts
import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';

export function createTaskRouter(taskController: TaskController): Router {
  const router = Router();

  // タスク一覧の取得
  router.get('/', (req, res) => taskController.getAllTasks(req, res));

  // タスク詳細の取得
  router.get('/:id', (req, res) => taskController.getTaskById(req, res));

  // タスクの作成
  router.post('/', (req, res) => taskController.createTask(req, res));

  // タスクの更新
  router.put('/:id', (req, res) => taskController.updateTask(req, res));

  // タスクの削除
  router.delete('/:id', (req, res) => taskController.deleteTask(req, res));

  return router;
}
```

### 3.3 タスク一覧の取得 API（ページネーション対応）

```typescript
// src/controllers/task.controller.ts に追加
// タスク一覧の取得（ページネーション対応）
async getAllTasks(req: Request, res: Response) {
  try {
    // クエリパラメータの取得
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // ページネーションの計算
    const skip = (page - 1) * limit;
    
    // タスク一覧の取得
    const allTasks = await this.taskService.getAllTasks();
    
    // ページネーション処理
    const paginatedTasks = allTasks.slice(skip, skip + limit);
    const totalTasks = allTasks.length;
    const totalPages = Math.ceil(totalTasks / limit);
    
    return this.sendResponse(res, 200, {
      tasks: paginatedTasks,
      pagination: {
        total: totalTasks,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('タスク一覧の取得に失敗しました', error);
    return this.sendError(res, 500, '内部サーバーエラー');
  }
}
```

### 3.4-3.7 APIエンドポイントの統合

```typescript
// src/app.ts に追加
import { FileService } from './services/file.service.js';
import { TaskService } from './services/task.service.js';
import { TaskController } from './controllers/task.controller.js';
import { createTaskRouter } from './routes/task.routes.js';
import { requestLogger } from './utils/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  
  // ミドルウェアの設定
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  
  // ヘルスチェックエンドポイント
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // サービスとコントローラーの初期化
  const fileService = new FileService();
  const taskService = new TaskService(fileService);
  const taskController = new TaskController(taskService);
  
  // APIルートの設定
  app.use('/api/tasks', createTaskRouter(taskController));
  
  // エラーハンドリングミドルウェア
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
}
```

## テスト

### タスクコントローラーのテスト

```typescript
// tests/unit/controllers/task.controller.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { TaskController } from '../../../src/controllers/task.controller.js';
import { TaskService } from '../../../src/services/task.service.js';

// TaskServiceのモック
const mockTaskService = {
  getAllTasks: vi.fn(),
  getTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  toggleTaskCompletion: vi.fn(),
  getCategories: vi.fn(),
} as unknown as TaskService;

// レスポンスのモック
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

// リクエストのモック
const mockRequest = (params = {}, body = {}, query = {}) => {
  return {
    params,
    body,
    query,
  } as unknown as Request;
};

describe('TaskController', () => {
  let taskController: TaskController;
  
  beforeEach(() => {
    vi.resetAllMocks();
    taskController = new TaskController(mockTaskService);
  });
  
  describe('getAllTasks', () => {
    it('タスク一覧を取得して200を返すべき', async () => {
      const mockTasks = [{ id: '1', title: 'テストタスク' }];
      mockTaskService.getAllTasks.mockResolvedValue(mockTasks);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await taskController.getAllTasks(req, res);
      
      expect(mockTaskService.getAllTasks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mockTasks });
    });
    
    it('エラー時に500を返すべき', async () => {
      mockTaskService.getAllTasks.mockRejectedValue(new Error('テストエラー'));
      
      const req = mockRequest();
      const res = mockResponse();
      
      await taskController.getAllTasks(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: '内部サーバーエラー' });
    });
  });
  
  describe('getTaskById', () => {
    it('存在するタスクを取得して200を返すべき', async () => {
      const mockTask = { id: '1', title: 'テストタスク' };
      mockTaskService.getTaskById.mockResolvedValue(mockTask);
      
      const req = mockRequest({ id: '1' });
      const res = mockResponse();
      
      await taskController.getTaskById(req, res);
      
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mockTask });
    });
    
    it('存在しないタスクの場合404を返すべき', async () => {
      mockTaskService.getTaskById.mockResolvedValue(null);
      
      const req = mockRequest({ id: '999' });
      const res = mockResponse();
      
      await taskController.getTaskById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID: 999 のタスクが見つかりません' });
    });
  });
  
  // 他のメソッドのテストも同様に実装
});
```

### APIエンドポイントの統合テスト

```typescript
// tests/integration/api/tasks.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';
import { FileService } from '../../../src/services/file.service.js';
import fs from 'fs/promises';
import path from 'path';

// テスト用のデータディレクトリ
const TEST_DATA_DIR = path.join(process.cwd(), 'test-data');
const TEST_TASKS_FILE = path.join(TEST_DATA_DIR, 'tasks.json');

// 環境変数の設定
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.NODE_ENV = 'test';

describe('タスクAPI統合テスト', () => {
  const app = createApp();
  let createdTaskId: string;
  
  beforeAll(async () => {
    // テスト用ディレクトリの作成
    try {
      await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }
    
    // テスト用データファイルの初期化
    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([]), 'utf-8');
  });
  
  afterAll(async () => {
    // テスト用ディレクトリの削除
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error('テストディレクトリの削除に失敗しました', error);
    }
  });
  
  it('タスクを作成できるべき', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: '統合テスト用タスク',
        priority: 'high',
        category: 'テスト',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('title', '統合テスト用タスク');
    
    // 後続のテストで使用するためにIDを保存
    createdTaskId = response.body.data.id;
  });
  
  it('タスク一覧を取得できるべき', async () => {
    const response = await request(app).get('/api/tasks');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.tasks)).toBe(true);
    expect(response.body.data.tasks.length).toBeGreaterThan(0);
  });
  
  it('特定のタスクを取得できるべき', async () => {
    const response = await request(app).get(`/api/tasks/${createdTaskId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id', createdTaskId);
    expect(response.body.data).toHaveProperty('title', '統合テスト用タスク');
  });
  
  it('タスクを更新できるべき', async () => {
    const response = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .send({
        title: '更新された統合テスト用タスク',
        priority: 'medium',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('title', '更新された統合テスト用タスク');
    expect(response.body.data).toHaveProperty('priority', 'medium');
  });
  
  it('タスクを削除できるべき', async () => {
    const response = await request(app).delete(`/api/tasks/${createdTaskId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id', createdTaskId);
    
    // 削除後に取得を試みると404が返るべき
    const getResponse = await request(app).get(`/api/tasks/${createdTaskId}`);
    expect(getResponse.status).toBe(404);
  });
});
```

## 次のステップ

フェーズ3が完了したら、フェーズ4（APIエンドポイントの実装（拡張機能））に進みます。
