# フェーズ4: APIエンドポイントの実装（拡張機能）

## 目標

基本的なCRUD操作に加えて、タスク管理に必要な拡張機能のAPIエンドポイントを実装します。

## タスク

### 4.1 タスク完了状態の切り替え API ✅

- 完了状態を切り替えるエンドポイント
- トグル操作の実装

### 4.2 タスクのメモ更新 API ✅

- メモのみを更新するエンドポイント
- 部分更新の最適化

### 4.3 カテゴリ一覧の取得 API ✅

- カテゴリ一覧を取得するエンドポイント
- 重複排除と並べ替え

### 4.4 タスクのフィルタリング機能 ✅

- 複数条件でのフィルタリング
- クエリパラメータの処理
- 検索機能の実装

### 4.5 タスクのソート機能 ✅

- 複数フィールドでのソート
- 昇順・降順の指定
- デフォルトソートの設定

### 4.6 バックアップと復元機能 ✅

- バックアップ作成エンドポイント
- バックアップ一覧取得エンドポイント
- バックアップからの復元エンドポイント

### 4.7 エクスポート/インポート機能 ✅

- タスクデータのエクスポートエンドポイント
- タスクデータのインポートエンドポイント

## 実装詳細

### 4.1 タスク完了状態の切り替え API

```typescript
// src/controllers/task.controller.ts に追加
// タスクの完了状態を切り替える
async toggleTaskCompletion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updatedTask = await this.taskService.toggleTaskCompletion(id);
    
    if (!updatedTask) {
      return this.sendError(res, 404, `ID: ${id} のタスクが見つかりません`);
    }
    
    return this.sendResponse(
      res, 
      200, 
      updatedTask, 
      `タスクを${updatedTask.completed ? '完了' : '未完了'}に設定しました`
    );
  } catch (error) {
    logger.error(`タスクの完了状態切り替えに失敗しました: ${req.params.id}`, error);
    return this.sendError(res, 500, '内部サーバーエラー');
  }
}
```

### 4.2 タスクのメモ更新 API

```typescript
// src/controllers/task.controller.ts に追加
// タスクのメモを更新する
async updateTaskMemo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { memo } = req.body;
    
    // メモのバリデーション
    if (memo === undefined) {
      return this.sendError(res, 400, 'メモが指定されていません');
    }
    
    // メモの更新
    const updatedTask = await this.taskService.updateTask(id, { memo });
    
    if (!updatedTask) {
      return this.sendError(res, 404, `ID: ${id} のタスクが見つかりません`);
    }
    
    return this.sendResponse(res, 200, updatedTask, 'メモが更新されました');
  } catch (error) {
    logger.error(`タスクのメモ更新に失敗しました: ${req.params.id}`, error);
    return this.sendError(res, 500, '内部サーバーエラー');
  }
}
```

### 4.3 カテゴリ一覧の取得 API

```typescript
// src/controllers/category.controller.ts
import { Request, Response } from 'express';
import { TaskService } from '../services/task.service.js';
import { logger } from '../utils/logger.js';

export class CategoryController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  // カテゴリ一覧を取得する
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await this.taskService.getCategories();
      
      // カテゴリを昇順でソート
      categories.sort((a, b) => a.localeCompare(b));
      
      return res.status(200).json({
        data: categories,
      });
    } catch (error) {
      logger.error('カテゴリ一覧の取得に失敗しました', error);
      return res.status(500).json({
        error: 'カテゴリ一覧の取得に失敗しました',
      });
    }
  }
}
```

### 4.4 タスクのフィルタリング機能

```typescript
// src/services/task.service.ts に追加
// タスクのフィルタリング
async filterTasks(filters: {
  status?: 'all' | 'completed' | 'active';
  priority?: Priority;
  category?: string;
  searchTerm?: string;
  dueDate?: string;
}): Promise<Task[]> {
  const tasks = await this.getAllTasks();
  
  return tasks.filter(task => {
    // ステータスでフィルタリング
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'completed' && !task.completed) return false;
      if (filters.status === 'active' && task.completed) return false;
    }
    
    // 優先度でフィルタリング
    if (filters.priority && task.priority !== filters.priority) return false;
    
    // カテゴリでフィルタリング
    if (filters.category && task.category !== filters.category) return false;
    
    // 期限でフィルタリング
    if (filters.dueDate) {
      // 期限なしのタスクを除外
      if (!task.dueDate) return false;
      
      // 日付の比較（YYYY-MM-DD形式で比較）
      const taskDate = task.dueDate.split('T')[0];
      const filterDate = filters.dueDate.split('T')[0];
      if (taskDate !== filterDate) return false;
    }
    
    // 検索語でフィルタリング
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const memoMatch = task.memo ? task.memo.toLowerCase().includes(searchLower) : false;
      const categoryMatch = task.category ? task.category.toLowerCase().includes(searchLower) : false;
      
      if (!titleMatch && !memoMatch && !categoryMatch) return false;
    }
    
    return true;
  });
}

// src/controllers/task.controller.ts に追加
// タスクのフィルタリング
async filterTasks(req: Request, res: Response) {
  try {
    const { status, priority, category, searchTerm, dueDate } = req.query;
    
    // フィルタリング条件の構築
    const filters: any = {};
    
    if (status && ['all', 'completed', 'active'].includes(status as string)) {
      filters.status = status;
    }
    
    if (priority && ['high', 'medium', 'low'].includes(priority as string)) {
      filters.priority = priority;
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }
    
    if (dueDate) {
      filters.dueDate = dueDate;
    }
    
    // タスクのフィルタリング
    const filteredTasks = await this.taskService.filterTasks(filters);
    
    // ページネーション処理
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const paginatedTasks = filteredTasks.slice(skip, skip + limit);
    const totalTasks = filteredTasks.length;
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
      filters,
    });
  } catch (error) {
    logger.error('タスクのフィルタリングに失敗しました', error);
    return this.sendError(res, 500, '内部サーバーエラー');
  }
}
```

### 4.5 タスクのソート機能

```typescript
// src/services/task.service.ts に追加
// タスクのソート
sortTasks(tasks: Task[], sortField: string, sortDirection: 'asc' | 'desc'): Task[] {
  return [...tasks].sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    // ソートフィールドに基づいて値を取得
    switch (sortField) {
      case 'title':
        valueA = a.title;
        valueB = b.title;
        break;
      case 'priority':
        // 優先度を数値に変換（high: 3, medium: 2, low: 1）
        const priorityValues = { high: 3, medium: 2, low: 1 };
        valueA = priorityValues[a.priority];
        valueB = priorityValues[b.priority];
        break;
      case 'dueDate':
        // 期限がないタスクは最後にソート
        valueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        valueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        break;
      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
        break;
      default:
        // デフォルトは作成日時
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
    }
    
    // ソート方向に基づいて比較
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
}

// src/controllers/task.controller.ts のfilterTasksメソッドを拡張
async filterTasks(req: Request, res: Response) {
  try {
    // ... 既存のフィルタリングコード ...
    
    // ソート条件の取得
    const sortField = (req.query.sortField as string) || 'createdAt';
    const sortDirection = (req.query.sortDirection as string === 'desc') ? 'desc' : 'asc';
    
    // タスクのフィルタリング
    let filteredTasks = await this.taskService.filterTasks(filters);
    
    // タスクのソート
    filteredTasks = this.taskService.sortTasks(filteredTasks, sortField, sortDirection);
    
    // ... 既存のページネーションコード ...
    
    return this.sendResponse(res, 200, {
      tasks: paginatedTasks,
      pagination: {
        // ... 既存のページネーション情報 ...
      },
      filters,
      sort: {
        field: sortField,
        direction: sortDirection,
      },
    });
  } catch (error) {
    // ... 既存のエラーハンドリングコード ...
  }
}
```

### ルーターの更新

```typescript
// src/routes/task.routes.ts を更新
import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';

export function createTaskRouter(taskController: TaskController): Router {
  const router = Router();

  // 基本的なCRUD操作
  router.get('/', (req, res) => taskController.filterTasks(req, res)); // フィルタリング対応
  router.get('/:id', (req, res) => taskController.getTaskById(req, res));
  router.post('/', (req, res) => taskController.createTask(req, res));
  router.put('/:id', (req, res) => taskController.updateTask(req, res));
  router.delete('/:id', (req, res) => taskController.deleteTask(req, res));
  
  // 拡張機能
  router.put('/:id/toggle', (req, res) => taskController.toggleTaskCompletion(req, res));
  router.put('/:id/memo', (req, res) => taskController.updateTaskMemo(req, res));

  return router;
}

// src/routes/category.routes.ts
import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';

export function createCategoryRouter(categoryController: CategoryController): Router {
  const router = Router();

  // カテゴリ一覧の取得
  router.get('/', (req, res) => categoryController.getCategories(req, res));

  return router;
}
```

### アプリケーションへの統合

```typescript
// src/app.ts を更新
import { FileService } from './services/file.service.js';
import { TaskService } from './services/task.service.js';
import { TaskController } from './controllers/task.controller.js';
import { CategoryController } from './controllers/category.controller.js';
import { createTaskRouter } from './routes/task.routes.js';
import { createCategoryRouter } from './routes/category.routes.js';

export function createApp() {
  // ... 既存のコード ...
  
  // サービスとコントローラーの初期化
  const fileService = new FileService();
  const taskService = new TaskService(fileService);
  const taskController = new TaskController(taskService);
  const categoryController = new CategoryController(taskService);
  
  // APIルートの設定
  app.use('/api/tasks', createTaskRouter(taskController));
  app.use('/api/categories', createCategoryRouter(categoryController));
  
  // ... 既存のコード ...
}
```

## テスト

### 拡張機能のテスト

```typescript
// tests/integration/api/tasks-advanced.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app.js';
import fs from 'fs/promises';
import path from 'path';

// テスト用のデータディレクトリ
const TEST_DATA_DIR = path.join(process.cwd(), 'test-data-advanced');
const TEST_TASKS_FILE = path.join(TEST_DATA_DIR, 'tasks.json');

// 環境変数の設定
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.NODE_ENV = 'test';

describe('タスクAPI拡張機能テスト', () => {
  const app = createApp();
  let taskId: string;
  
  beforeAll(async () => {
    // テスト用ディレクトリの作成
    try {
      await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }
    
    // テスト用データファイルの初期化
    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([]), 'utf-8');
    
    // テスト用タスクの作成
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: '拡張機能テスト用タスク',
        priority: 'medium',
        category: 'テスト',
        memo: 'これはテスト用のメモです',
      });
    
    taskId = response.body.data.id;
  });
  
  afterAll(async () => {
    // テスト用ディレクトリの削除
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error('テストディレクトリの削除に失敗しました', error);
    }
  });
  
  it('タスクの完了状態を切り替えられるべき', async () => {
    const response = await request(app)
      .put(`/api/tasks/${taskId}/toggle`)
      .send();
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('completed', true);
    
    // もう一度トグルして未完了に戻す
    const response2 = await request(app)
      .put(`/api/tasks/${taskId}/toggle`)
      .send();
    
    expect(response2.status).toBe(200);
    expect(response2.body.data).toHaveProperty('completed', false);
  });
  
  it('タスクのメモを更新できるべき', async () => {
    const newMemo = '更新されたメモ内容';
    const response = await request(app)
      .put(`/api/tasks/${taskId}/memo`)
      .send({ memo: newMemo });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('memo', newMemo);
  });
  
  it('カテゴリ一覧を取得できるべき', async () => {
    const response = await request(app).get('/api/categories');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toContain('テスト');
  });
  
  it('タスクをフィルタリングできるべき', async () => {
    // カテゴリでフィルタリング
    const response = await request(app)
      .get('/api/tasks')
      .query({ category: 'テスト' });
    
    expect(response.status).toBe(200);
    expect(response.body.data.tasks.length).toBeGreaterThan(0);
    expect(response.body.data.tasks[0]).toHaveProperty('category', 'テスト');
    
    // 検索語でフィルタリング
    const response2 = await request(app)
      .get('/api/tasks')
      .query({ searchTerm: '拡張機能' });
    
    expect(response2.status).toBe(200);
    expect(response2.body.data.tasks.length).toBeGreaterThan(0);
    expect(response2.body.data.tasks[0].title).toContain('拡張機能');
  });
  
  it('タスクをソートできるべき', async () => {
    // 追加のタスクを作成（ソートテスト用）
    await request(app)
      .post('/api/tasks')
      .send({
        title: 'Aで始まるタスク',
        priority: 'high',
      });
    
    // タイトルで昇順ソート
    const response = await request(app)
      .get('/api/tasks')
      .query({ sortField: 'title', sortDirection: 'asc' });
    
    expect(response.status).toBe(200);
    expect(response.body.data.tasks.length).toBeGreaterThan(1);
    expect(response.body.data.tasks[0].title).toBe('Aで始まるタスク');
    
    // 優先度で降順ソート
    const response2 = await request(app)
      .get('/api/tasks')
      .query({ sortField: 'priority', sortDirection: 'desc' });
    
    expect(response2.status).toBe(200);
    expect(response2.body.data.tasks.length).toBeGreaterThan(1);
    expect(response2.body.data.tasks[0].priority).toBe('high');
  });
});
```

## 次のステップ

フェーズ4が完了したら、フェーズ5（セキュリティと最適化）に進みます。
