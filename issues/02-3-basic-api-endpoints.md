# フェーズ3: APIエンドポイントの実装（基本機能）

## 目標

タスクの基本的なCRUD操作（作成、読み取り、更新、削除）のためのAPIエンドポイントを実装します。

## タスク

### 3.1 タスクコントローラーの実装 ✅

- タスク一覧取得メソッドの実装
- タスク詳細取得メソッドの実装
- タスク作成メソッドの実装
- タスク更新メソッドの実装
- タスク削除メソッドの実装
- リクエストバリデーションの実装

### 3.2 APIルートの設定 ✅

- Expressルーターの設定
- エンドポイントとコントローラーメソッドのマッピング
- ルートパラメータの設定

### 3.3 タスク一覧の取得 API ✅

- `GET /api/tasks` エンドポイントの実装
- タスク一覧の取得と返却
- エラーハンドリング

### 3.4 タスク詳細の取得 API ✅

- `GET /api/tasks/:id` エンドポイントの実装
- 特定のタスクの取得と返却
- 存在しないタスクの処理
- エラーハンドリング

### 3.5 タスク作成 API ✅

- `POST /api/tasks` エンドポイントの実装
- リクエストボディのバリデーション
- タスクの作成と返却
- エラーハンドリング

### 3.6 タスク更新 API ✅

- `PUT /api/tasks/:id` エンドポイントの実装
- リクエストボディのバリデーション
- タスクの更新と返却
- 存在しないタスクの処理
- エラーハンドリング

### 3.7 タスク削除 API ✅

- `DELETE /api/tasks/:id` エンドポイントの実装
- タスクの削除
- 存在しないタスクの処理
- エラーハンドリング

## 実装詳細

### 3.1 タスクコントローラーの実装

```typescript
// src/controllers/task.controller.ts
import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { CreateTaskSchema, UpdateTaskSchema } from '../models/task.model.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  // タスク一覧の取得
  getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.getAllTasks();
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  // 特定のタスクの取得
  getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);

      if (!task) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  // タスクの作成
  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // リクエストボディのバリデーション
      const taskData = CreateTaskSchema.parse(req.body);
      
      const newTask = await this.taskService.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'バリデーションエラー', 
          details: error.errors 
        });
        return;
      }
      next(error);
    }
  };

  // タスクの更新
  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      // リクエストボディのバリデーション
      const taskData = UpdateTaskSchema.parse(req.body);
      
      const updatedTask = await this.taskService.updateTask(id, taskData);

      if (!updatedTask) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'バリデーションエラー', 
          details: error.errors 
        });
        return;
      }
      next(error);
    }
  };

  // タスクの削除
  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.taskService.deleteTask(id);

      if (!result) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
```

### 3.2 APIルートの設定

```typescript
// src/routes/task.routes.ts
import express from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { TaskService } from '../services/task.service.js';
import { FileService } from '../services/file.service.js';

// サービスのインスタンス化
const fileService = new FileService();
const taskService = new TaskService(fileService);
const taskController = new TaskController(taskService);

// ルーターの作成
export const taskRoutes = express.Router();

// タスク関連のエンドポイント
taskRoutes.get('/tasks', taskController.getAllTasks);
taskRoutes.get('/tasks/:id', taskController.getTaskById);
taskRoutes.post('/tasks', taskController.createTask);
taskRoutes.put('/tasks/:id', taskController.updateTask);
taskRoutes.delete('/tasks/:id', taskController.deleteTask);
```

### 3.3-3.7 APIエンドポイントの実装

アプリケーションのエントリーポイントでルーターを設定します：

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { taskRoutes } from './routes/task.routes.js';
import { requestLogger } from './utils/logger.js';
import { notFoundHandler, errorHandler } from './middleware/error.handler.js';
import { env } from './config/env.js';

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // ミドルウェアの設定
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // ヘルスチェックエンドポイント
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
  });

  // APIルートの設定
  app.use('/api', taskRoutes);

  // エラーハンドリングミドルウェア
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
```

## テスト

### コントローラーのユニットテスト

```typescript
// tests/unit/controllers/task.controller.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskController } from '../../../src/controllers/task.controller.js';
import { TaskService } from '../../../src/services/task.service.js';
import { Task } from '../../../src/models/task.model.js';
import { Request, Response } from 'express';

// TaskServiceのモック
const mockTaskService = {
  getAllTasks: vi.fn(),
  getTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
} as unknown as TaskService;

// テストケース...
```

### APIエンドポイントの統合テスト

```typescript
// tests/integration/api/tasks.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';
import fs from 'fs/promises';
import path from 'path';

describe('タスクAPI', () => {
  // テストケース...
});
```

## 実装結果

フェーズ3の実装が完了しました。以下の機能が実装されています：

1. **タスクコントローラー**
   - タスク一覧取得メソッド
   - タスク詳細取得メソッド
   - タスク作成メソッド
   - タスク更新メソッド
   - タスク削除メソッド
   - リクエストバリデーション

2. **APIルート**
   - `GET /api/tasks` - タスク一覧の取得
   - `GET /api/tasks/:id` - 特定のタスクの取得
   - `POST /api/tasks` - 新しいタスクの作成
   - `PUT /api/tasks/:id` - タスクの更新
   - `DELETE /api/tasks/:id` - タスクの削除

3. **エラーハンドリング**
   - バリデーションエラーの処理
   - 存在しないリソースの処理
   - サーバーエラーの処理

すべてのテストが正常に実行され、フェーズ3の実装が完了しました。

## 次のステップ

フェーズ4（APIエンドポイントの実装（拡張機能））に進みます。
