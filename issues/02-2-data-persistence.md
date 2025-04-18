# フェーズ2: データ永続化レイヤーの実装

## 目標

ファイルシステムを使用したデータ永続化レイヤーを実装し、タスクデータのCRUD操作を可能にします。

## タスク

### 2.1 データモデルの定義 ⬜

- Zodを使用したスキーマ定義
- 型定義の作成
- バリデーション関数の実装

### 2.2 ファイルシステムサービスの実装 ⬜

- データディレクトリの作成と確認
- ファイル読み書き機能の実装
- エラーハンドリング

### 2.3 タスクサービスの実装 ⬜

- タスク一覧の取得
- タスク詳細の取得
- タスクの作成
- タスクの更新
- タスクの削除

### 2.4 データ整合性の確保 ⬜

- トランザクション的な操作の実装
- バックアップ機能の実装
- データ検証機能の実装

## 実装詳細

### 2.1 データモデルの定義

```typescript
// src/models/task.model.ts
import { z } from 'zod';

// 優先度の定義
export const PriorityEnum = z.enum(['high', 'medium', 'low']);
export type Priority = z.infer<typeof PriorityEnum>;

// タスク作成時のスキーマ
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内にしてください'),
  completed: z.boolean().default(false),
  priority: PriorityEnum.default('medium'),
  category: z.string().optional(),
  dueDate: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: '有効な日付形式ではありません' }
  ),
  memo: z.string().optional(),
});

// タスク更新時のスキーマ
export const UpdateTaskSchema = CreateTaskSchema.partial();

// タスクの完全なスキーマ（IDと日時情報を含む）
export const TaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 型定義のエクスポート
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type Task = z.infer<typeof TaskSchema>;
```

### 2.2 ファイルシステムサービスの実装

```typescript
// src/services/file.service.ts
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// ESM環境でのディレクトリ名取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FileService {
  private dataDir: string;

  constructor() {
    this.dataDir = env.DATA_DIR;
    this.ensureDataDirectory();
  }

  // データディレクトリの存在確認と作成
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch (error) {
      logger.info(`データディレクトリが存在しないため作成します: ${this.dataDir}`);
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  // ファイルの読み込み
  async readFile<T>(filename: string, defaultValue: T): Promise<T> {
    const filePath = path.join(this.dataDir, filename);
    
    try {
      await fs.access(filePath);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.info(`ファイルが存在しないため、デフォルト値を使用します: ${filename}`);
        await this.writeFile(filename, defaultValue);
        return defaultValue;
      }
      
      logger.error(`ファイル読み込みエラー: ${filename}`, error);
      throw new Error(`ファイル読み込みエラー: ${filename}`);
    }
  }

  // ファイルの書き込み
  async writeFile<T>(filename: string, data: T): Promise<void> {
    const filePath = path.join(this.dataDir, filename);
    
    try {
      // バックアップの作成（既存ファイルの場合）
      try {
        await fs.access(filePath);
        const backupPath = `${filePath}.backup`;
        await fs.copyFile(filePath, backupPath);
      } catch (error) {
        // ファイルが存在しない場合は何もしない
      }
      
      // ファイルの書き込み
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      logger.error(`ファイル書き込みエラー: ${filename}`, error);
      throw new Error(`ファイル書き込みエラー: ${filename}`);
    }
  }
}
```

### 2.3 タスクサービスの実装

```typescript
// src/services/task.service.ts
import { v4 as uuidv4 } from 'uuid';
import { FileService } from './file.service.js';
import { Task, CreateTaskInput, UpdateTaskInput } from '../models/task.model.js';
import { logger } from '../utils/logger.js';

export class TaskService {
  private fileService: FileService;
  private readonly TASKS_FILE = 'tasks.json';

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  // 全タスクの取得
  async getAllTasks(): Promise<Task[]> {
    return this.fileService.readFile<Task[]>(this.TASKS_FILE, []);
  }

  // IDによるタスクの取得
  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    return tasks.find(task => task.id === id) || null;
  }

  // タスクの作成
  async createTask(taskData: CreateTaskInput): Promise<Task> {
    const tasks = await this.getAllTasks();
    
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    await this.fileService.writeFile(this.TASKS_FILE, tasks);
    
    logger.info(`タスクが作成されました: ${newTask.id}`);
    return newTask;
  }

  // タスクの更新
  async updateTask(id: string, taskData: UpdateTaskInput): Promise<Task | null> {
    const tasks = await this.getAllTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }
    
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    await this.fileService.writeFile(this.TASKS_FILE, tasks);
    
    logger.info(`タスクが更新されました: ${id}`);
    return updatedTask;
  }

  // タスクの削除
  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.getAllTasks();
    const initialLength = tasks.length;
    
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === initialLength) {
      return false;
    }
    
    await this.fileService.writeFile(this.TASKS_FILE, filteredTasks);
    
    logger.info(`タスクが削除されました: ${id}`);
    return true;
  }

  // タスクの完了状態の切り替え
  async toggleTaskCompletion(id: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    
    if (!task) {
      return null;
    }
    
    return this.updateTask(id, { completed: !task.completed });
  }

  // カテゴリ一覧の取得
  async getCategories(): Promise<string[]> {
    const tasks = await this.getAllTasks();
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

### 2.4 データ整合性の確保

```typescript
// src/utils/data-validator.ts
import { z } from 'zod';
import { TaskSchema } from '../models/task.model.js';
import { logger } from './logger.js';

// タスク配列のスキーマ
const TasksArraySchema = z.array(TaskSchema);

// データ検証関数
export async function validateTasksData(data: unknown): Promise<boolean> {
  try {
    TasksArraySchema.parse(data);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('データ検証エラー:', error.errors);
    }
    return false;
  }
}
```

## テスト

### ファイルサービスのテスト

```typescript
// tests/unit/services/file.service.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileService } from '../../../src/services/file.service.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト用のデータディレクトリ
const TEST_DATA_DIR = path.join(__dirname, '../../../test-data');

// モック環境変数の設定
vi.mock('../../../src/config/env.js', () => ({
  env: {
    DATA_DIR: TEST_DATA_DIR,
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
  },
}));

describe('FileService', () => {
  let fileService: FileService;
  
  beforeEach(async () => {
    // テスト用ディレクトリの作成
    try {
      await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }
    
    fileService = new FileService();
  });
  
  afterEach(async () => {
    // テスト用ディレクトリの削除
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error('テストディレクトリの削除に失敗しました', error);
    }
  });
  
  it('ファイルが存在しない場合はデフォルト値を返すべき', async () => {
    const defaultData = { test: 'data' };
    const result = await fileService.readFile('non-existent.json', defaultData);
    expect(result).toEqual(defaultData);
  });
  
  it('ファイルの書き込みと読み込みが正しく動作するべき', async () => {
    const testData = { test: 'write and read' };
    const filename = 'test-file.json';
    
    await fileService.writeFile(filename, testData);
    const result = await fileService.readFile(filename, {});
    
    expect(result).toEqual(testData);
  });
});
```

### タスクサービスのテスト

```typescript
// tests/unit/services/task.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from '../../../src/services/task.service.js';
import { FileService } from '../../../src/services/file.service.js';

// FileServiceのモック
vi.mock('../../../src/services/file.service.js', () => {
  const mockTasks = [];
  
  return {
    FileService: vi.fn().mockImplementation(() => ({
      readFile: vi.fn().mockImplementation((filename, defaultValue) => {
        if (filename === 'tasks.json') {
          return Promise.resolve([...mockTasks]);
        }
        return Promise.resolve(defaultValue);
      }),
      writeFile: vi.fn().mockImplementation((filename, data) => {
        if (filename === 'tasks.json') {
          mockTasks.length = 0;
          mockTasks.push(...data);
        }
        return Promise.resolve();
      }),
    })),
  };
});

describe('TaskService', () => {
  let taskService: TaskService;
  let fileService: FileService;
  
  beforeEach(() => {
    fileService = new FileService();
    taskService = new TaskService(fileService);
  });
  
  it('タスクを作成できるべき', async () => {
    const taskData = {
      title: 'テストタスク',
      priority: 'medium' as const,
    };
    
    const createdTask = await taskService.createTask(taskData);
    
    expect(createdTask).toHaveProperty('id');
    expect(createdTask).toHaveProperty('title', 'テストタスク');
    expect(createdTask).toHaveProperty('priority', 'medium');
    expect(createdTask).toHaveProperty('completed', false);
    expect(createdTask).toHaveProperty('createdAt');
    expect(createdTask).toHaveProperty('updatedAt');
  });
  
  it('作成したタスクを取得できるべき', async () => {
    const taskData = {
      title: 'テストタスク2',
      priority: 'high' as const,
    };
    
    const createdTask = await taskService.createTask(taskData);
    const tasks = await taskService.getAllTasks();
    
    expect(tasks).toContainEqual(createdTask);
  });
  
  it('IDでタスクを取得できるべき', async () => {
    const taskData = {
      title: 'テストタスク3',
      priority: 'low' as const,
    };
    
    const createdTask = await taskService.createTask(taskData);
    const retrievedTask = await taskService.getTaskById(createdTask.id);
    
    expect(retrievedTask).toEqual(createdTask);
  });
  
  it('タスクを更新できるべき', async () => {
    const taskData = {
      title: '更新前のタスク',
      priority: 'medium' as const,
    };
    
    const createdTask = await taskService.createTask(taskData);
    const updatedTask = await taskService.updateTask(createdTask.id, {
      title: '更新後のタスク',
      priority: 'high' as const,
    });
    
    expect(updatedTask).toHaveProperty('title', '更新後のタスク');
    expect(updatedTask).toHaveProperty('priority', 'high');
  });
  
  it('タスクを削除できるべき', async () => {
    const taskData = {
      title: '削除するタスク',
    };
    
    const createdTask = await taskService.createTask(taskData);
    const result = await taskService.deleteTask(createdTask.id);
    const tasks = await taskService.getAllTasks();
    
    expect(result).toBe(true);
    expect(tasks).not.toContainEqual(createdTask);
  });
});
```

## 次のステップ

フェーズ2が完了したら、フェーズ3（APIエンドポイントの実装（基本機能））に進みます。
