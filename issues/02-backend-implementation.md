# バックエンド実装の詳細設計

## 概要

TodoLogアプリケーションのバックエンド部分の詳細設計について記述します。バックエンドはNode.js + Express + TypeScriptで実装し、ファイルシステムを使用してデータを永続化します。

## 技術スタック

- **ランタイム**: Node.js (v18以上)
- **フレームワーク**: Express.js
- **言語**: TypeScript
- **データ永続化**: ファイルシステム (fs/promises)
- **バリデーション**: Zod
- **ロギング**: Winston
- **テスト**: Vitest
- **API文書化**: Swagger/OpenAPI

## プロジェクト構造

```
server/
├── src/
│   ├── controllers/       # APIエンドポイントのコントローラー
│   │   ├── taskController.ts
│   │   └── categoryController.ts
│   ├── models/            # データモデルとスキーマ
│   │   ├── task.ts
│   │   └── types.ts
│   ├── routes/            # APIルート定義
│   │   ├── taskRoutes.ts
│   │   └── categoryRoutes.ts
│   ├── services/          # ビジネスロジック
│   │   ├── taskService.ts
│   │   ├── fileService.ts
│   │   └── categoryService.ts
│   ├── middleware/        # ミドルウェア
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── utils/             # ユーティリティ関数
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── config/            # 設定
│   │   └── index.ts
│   └── app.ts             # Expressアプリケーション
│   └── index.ts           # エントリーポイント
├── tests/                 # テスト
│   ├── unit/
│   └── integration/
├── .env                   # 環境変数
├── .env.example           # 環境変数のサンプル
├── package.json
├── tsconfig.json
└── jest.config.js
```

## データモデル

### Task

```typescript
// src/models/types.ts
export enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

export interface Task {
  id: string;          // ユニークID
  title: string;       // タスクのタイトル
  completed: boolean;  // 完了状態
  priority: Priority;  // 優先度
  category?: string;   // カテゴリ（オプション）
  dueDate?: string;    // 期限（ISO形式の文字列）
  createdAt: string;   // 作成日時（ISO形式の文字列）
  updatedAt: string;   // 更新日時（ISO形式の文字列）
  memo?: string;       // メモ（オプション）
}

// src/models/task.ts
import { z } from 'zod';
import { Priority } from './types';

// タスク作成用のスキーマ
export const createTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  priority: z.nativeEnum(Priority).default(Priority.Medium),
  category: z.string().optional(),
  dueDate: z.string().optional(), // ISO形式の日付文字列
  memo: z.string().optional(),
});

// タスク更新用のスキーマ
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').optional(),
  completed: z.boolean().optional(),
  priority: z.nativeEnum(Priority).optional(),
  category: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(), // ISO形式の日付文字列
  memo: z.string().optional().nullable(),
});

// メモ更新用のスキーマ
export const updateMemoSchema = z.object({
  memo: z.string(),
});

// タスクトグル用のスキーマ
export const toggleTaskSchema = z.object({
  completed: z.boolean(),
});
```

## APIエンドポイント

### タスク関連

| メソッド | エンドポイント | 説明 | リクエスト | レスポンス |
|---------|--------------|------|-----------|-----------|
| GET | /api/tasks | タスク一覧の取得 | クエリパラメータ（フィルタ、ソート） | タスクの配列 |
| GET | /api/tasks/:id | 特定のタスクの取得 | - | タスクオブジェクト |
| POST | /api/tasks | 新しいタスクの作成 | タスクデータ | 作成されたタスク |
| PUT | /api/tasks/:id | タスクの更新 | 更新データ | 更新されたタスク |
| DELETE | /api/tasks/:id | タスクの削除 | - | 成功メッセージ |
| PUT | /api/tasks/:id/toggle | タスクの完了状態の切り替え | { completed: boolean } | 更新されたタスク |
| PUT | /api/tasks/:id/memo | タスクのメモ更新 | { memo: string } | 更新されたタスク |

### カテゴリ関連

| メソッド | エンドポイント | 説明 | リクエスト | レスポンス |
|---------|--------------|------|-----------|-----------|
| GET | /api/categories | カテゴリ一覧の取得 | - | カテゴリの配列 |

## サービス層

### FileService

```typescript
// src/services/fileService.ts
import { promises as fs } from 'fs';
import path from 'path';
import { Task } from '../models/types';

export class FileService {
  private dataPath: string;

  constructor(dataDir?: string) {
    // 環境変数またはデフォルト値からデータディレクトリを取得
    const baseDir = dataDir || process.env.DATA_DIR || path.join(process.cwd(), 'data');
    this.dataPath = path.join(baseDir, 'tasks.json');
    
    // データディレクトリの初期化
    this.initDataDir();
  }

  private async initDataDir(): Promise<void> {
    try {
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error('データディレクトリの作成に失敗しました:', error);
    }
  }

  async readTasks(): Promise<Task[]> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data) as Task[];
    } catch (error) {
      // ファイルが存在しない場合は空の配列を返す
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeTasks(tasks: Task[]): Promise<void> {
    await fs.writeFile(this.dataPath, JSON.stringify(tasks, null, 2), 'utf-8');
  }

  async exportTasks(exportPath: string): Promise<void> {
    const tasks = await this.readTasks();
    await fs.writeFile(exportPath, JSON.stringify(tasks, null, 2), 'utf-8');
  }

  async importTasks(importPath: string): Promise<Task[]> {
    const data = await fs.readFile(importPath, 'utf-8');
    const tasks = JSON.parse(data) as Task[];
    await this.writeTasks(tasks);
    return tasks;
  }
}
```

### TaskService

```typescript
// src/services/taskService.ts
import { v4 as uuidv4 } from 'uuid';
import { FileService } from './fileService';
import { Task, Priority } from '../models/types';

export class TaskService {
  private fileService: FileService;

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  async getAllTasks(): Promise<Task[]> {
    return this.fileService.readTasks();
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.fileService.readTasks();
    return tasks.find(task => task.id === id) || null;
  }

  async createTask(taskData: {
    title: string;
    priority?: Priority;
    category?: string;
    dueDate?: string;
    memo?: string;
  }): Promise<Task> {
    const tasks = await this.fileService.readTasks();
    
    const now = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title,
      completed: false,
      priority: taskData.priority || Priority.Medium,
      category: taskData.category,
      dueDate: taskData.dueDate,
      memo: taskData.memo,
      createdAt: now,
      updatedAt: now,
    };
    
    tasks.push(newTask);
    await this.fileService.writeTasks(tasks);
    
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const tasks = await this.fileService.readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    await this.fileService.writeTasks(tasks);
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.fileService.readTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      return false; // タスクが見つからなかった
    }
    
    await this.fileService.writeTasks(filteredTasks);
    return true;
  }

  async toggleTaskCompletion(id: string, completed?: boolean): Promise<Task | null> {
    const task = await this.getTaskById(id);
    
    if (!task) {
      return null;
    }
    
    const newCompleted = completed !== undefined ? completed : !task.completed;
    
    return this.updateTask(id, { completed: newCompleted });
  }

  async updateTaskMemo(id: string, memo: string): Promise<Task | null> {
    return this.updateTask(id, { memo });
  }

  async getCategories(): Promise<string[]> {
    const tasks = await this.fileService.readTasks();
    const categories = new Set<string>();
    
    tasks.forEach(task => {
      if (task.category) {
        categories.add(task.category);
      }
    });
    
    return Array.from(categories);
  }
}
```

## コントローラー

### TaskController

```typescript
// src/controllers/taskController.ts
import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { createTaskSchema, updateTaskSchema, updateMemoSchema, toggleTaskSchema } from '../models/task';
import { Priority } from '../models/types';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  // タスク一覧の取得
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.taskService.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'タスクの取得に失敗しました' });
    }
  }

  // 特定のタスクの取得
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'タスクの取得に失敗しました' });
    }
  }

  // 新しいタスクの作成
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const result = createTaskSchema.safeParse(req.body);
      
      if (!result.success) {
        res.status(400).json({ error: '無効なデータ', details: result.error.format() });
        return;
      }
      
      const task = await this.taskService.createTask(result.data);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: 'タスクの作成に失敗しました' });
    }
  }

  // タスクの更新
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = updateTaskSchema.safeParse(req.body);
      
      if (!result.success) {
        res.status(400).json({ error: '無効なデータ', details: result.error.format() });
        return;
      }
      
      const updatedTask = await this.taskService.updateTask(id, result.data);
      
      if (!updatedTask) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: 'タスクの更新に失敗しました' });
    }
  }

  // タスクの削除
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.taskService.deleteTask(id);
      
      if (!success) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }
      
      res.json({ message: 'タスクが削除されました' });
    } catch (error) {
      res.status(500).json({ error: 'タスクの削除に失敗しました' });
    }
  }

  // タスクの完了状態の切り替え
  async toggleTaskCompletion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = toggleTaskSchema.safeParse(req.body);
      
      if (!result.success) {
        const updatedTask = await this.taskService.toggleTaskCompletion(id);
        
        if (!updatedTask) {
          res.status(404).json({ error: 'タスクが見つかりません' });
          return;
        }
        
        res.json(updatedTask);
      } else {
        const updatedTask = await this.taskService.toggleTaskCompletion(id, result.data.completed);
        
        if (!updatedTask) {
          res.status(404).json({ error: 'タスクが見つかりません' });
          return;
        }
        
        res.json(updatedTask);
      }
    } catch (error) {
      res.status(500).json({ error: 'タスクの状態変更に失敗しました' });
    }
  }

  // タスクのメモ更新
  async updateTaskMemo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = updateMemoSchema.safeParse(req.body);
      
      if (!result.success) {
        res.status(400).json({ error: '無効なデータ', details: result.error.format() });
        return;
      }
      
      const updatedTask = await this.taskService.updateTaskMemo(id, result.data.memo);
      
      if (!updatedTask) {
        res.status(404).json({ error: 'タスクが見つかりません' });
        return;
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: 'メモの更新に失敗しました' });
    }
  }
}
```

### CategoryController

```typescript
// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

export class CategoryController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  // カテゴリ一覧の取得
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.taskService.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'カテゴリの取得に失敗しました' });
    }
  }
}
```

## ルート定義

### タスクルート

```typescript
// src/routes/taskRoutes.ts
import { Router } from 'express';
import { TaskController } from '../controllers/taskController';

export function createTaskRouter(taskController: TaskController): Router {
  const router = Router();

  // タスク一覧の取得
  router.get('/', (req, res) => taskController.getTasks(req, res));

  // 特定のタスクの取得
  router.get('/:id', (req, res) => taskController.getTaskById(req, res));

  // 新しいタスクの作成
  router.post('/', (req, res) => taskController.createTask(req, res));

  // タスクの更新
  router.put('/:id', (req, res) => taskController.updateTask(req, res));

  // タスクの削除
  router.delete('/:id', (req, res) => taskController.deleteTask(req, res));

  // タスクの完了状態の切り替え
  router.put('/:id/toggle', (req, res) => taskController.toggleTaskCompletion(req, res));

  // タスクのメモ更新
  router.put('/:id/memo', (req, res) => taskController.updateTaskMemo(req, res));

  return router;
}
```

### カテゴリルート

```typescript
// src/routes/categoryRoutes.ts
import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

export function createCategoryRouter(categoryController: CategoryController): Router {
  const router = Router();

  // カテゴリ一覧の取得
  router.get('/', (req, res) => categoryController.getCategories(req, res));

  return router;
}
```

## アプリケーション設定

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createTaskRouter } from './routes/taskRoutes';
import { createCategoryRouter } from './routes/categoryRoutes';
import { TaskController } from './controllers/taskController';
import { CategoryController } from './controllers/categoryController';
import { TaskService } from './services/taskService';
import { FileService } from './services/fileService';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

export function createApp() {
  const app = express();

  // ミドルウェア
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // サービスの初期化
  const fileService = new FileService();
  const taskService = new TaskService(fileService);

  // コントローラーの初期化
  const taskController = new TaskController(taskService);
  const categoryController = new CategoryController(taskService);

  // ルートの設定
  app.use('/api/tasks', createTaskRouter(taskController));
  app.use('/api/categories', createCategoryRouter(categoryController));

  // エラーハンドラー
  app.use(errorHandler);

  return app;
}
```

## エントリーポイント

```typescript
// src/index.ts
import { createApp } from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

const app = createApp();

app.listen(PORT, () => {
  logger.info(`サーバーが起動しました: http://localhost:${PORT}`);
});
```

## 環境変数

```
# .env.example
PORT=3001
DATA_DIR=./data
NODE_ENV=development
LOG_LEVEL=info
```

## パッケージ設定

```json
// package.json
{
  "name": "todolog-server",
  "version": "1.0.0",
  "description": "TodoLog application backend",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts",
    "test": "vitest",
    "coverage": "vitest run --coverage",
    "lint": "biome lint src",
    "format": "biome format --write src"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "helmet": "^6.0.1",
    "uuid": "^9.0.0",
    "winston": "^3.8.2",
    "zod": "^3.21.4"
  },
  "devDependencies": {
    "@biomejs/biome": "1.5.3",
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/node": "^18.15.11",
    "@types/supertest": "^2.0.12",
    "@types/uuid": "^9.0.1",
    "supertest": "^6.3.3",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.4",
    "vitest": "^1.0.4"
  }
}
```

## テスト戦略

1. **ユニットテスト**:
   - サービス層のテスト
   - コントローラーのテスト（モックを使用）

2. **統合テスト**:
   - APIエンドポイントのテスト
   - ファイル操作のテスト（テスト用ディレクトリを使用）

3. **エンドツーエンドテスト**:
   - フロントエンドとバックエンドの連携テスト

## セキュリティ対策

1. **Helmet**: セキュリティヘッダーの設定
2. **CORS**: 適切なオリジン設定
3. **入力バリデーション**: Zodによる厳格なバリデーション
4. **エラーハンドリング**: 詳細なエラー情報の隠蔽

## パフォーマンス最適化

1. **キャッシング**: 頻繁に変更されないデータのメモリキャッシュ
2. **圧縮**: 応答データの圧縮
3. **ページネーション**: 大量のタスクがある場合のページング

## 今後の拡張性

1. **データベース移行**: ファイルベースからSQLiteやMongoDBへの移行
2. **ユーザー認証**: 複数ユーザーのサポート
3. **WebSocket**: リアルタイム更新のサポート
4. **タスク共有**: 複数ユーザー間でのタスク共有機能
