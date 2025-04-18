# フェーズ2: データ永続化レイヤーの実装

## 目標

ファイルシステムを使用したデータ永続化レイヤーを実装し、タスクデータのCRUD操作を可能にします。

## タスク

### 2.1 データモデルの定義 ✅

- Zodを使用したタスクモデルのスキーマ定義
- 型定義のエクスポート
- バリデーションルールの設定

### 2.2 ファイルシステムを使用したデータ永続化サービスの実装 ✅

- ファイル操作用のサービスクラス作成
- ファイル読み込み機能の実装
- ファイル書き込み機能の実装
- バックアップ機能の実装

### 2.3 タスクサービスの実装 ✅

- タスクのCRUD操作の実装
- タスク一覧取得機能の実装
- タスク詳細取得機能の実装
- タスク作成機能の実装
- タスク更新機能の実装
- タスク削除機能の実装
- タスク完了状態切り替え機能の実装
- カテゴリ一覧取得機能の実装

### 2.4 データ整合性の確保 ✅

- データバリデーション機能の実装
- データ修復機能の実装
- エラーハンドリングの強化

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

### 2.2 ファイルシステムを使用したデータ永続化サービスの実装

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
      logger.info(`データディレクトリが存在します: ${this.dataDir}`);
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
        logger.debug(`バックアップファイルを作成しました: ${backupPath}`);
      } catch (error) {
        // ファイルが存在しない場合は何もしない
      }
      
      // ファイルの書き込み
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      logger.debug(`ファイルを保存しました: ${filename}`);
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
      completed: taskData.completed ?? false,
      priority: taskData.priority ?? 'medium',
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

// データ修復関数
export async function repairTasksData(data: unknown): Promise<any[]> {
  if (!Array.isArray(data)) {
    logger.warn('データが配列ではありません。空の配列を返します。');
    return [];
  }

  // 有効なタスクのみをフィルタリング
  const validTasks = data.filter(item => {
    try {
      TaskSchema.parse(item);
      return true;
    } catch (error) {
      logger.warn(`無効なタスクデータをスキップします: ${JSON.stringify(item)}`);
      return false;
    }
  });

  return validTasks;
}
```

## テスト

### データモデルのテスト

```typescript
// tests/unit/models/task.model.test.ts
import { describe, it, expect } from 'vitest';
import { CreateTaskSchema, UpdateTaskSchema, TaskSchema, PriorityEnum } from '../../../src/models/task.model.js';
import { z } from 'zod';

describe('タスクモデル', () => {
  describe('PriorityEnum', () => {
    it('有効な優先度値を受け入れるべき', () => {
      expect(PriorityEnum.parse('high')).toBe('high');
      expect(PriorityEnum.parse('medium')).toBe('medium');
      expect(PriorityEnum.parse('low')).toBe('low');
    });

    it('無効な優先度値を拒否するべき', () => {
      expect(() => PriorityEnum.parse('invalid')).toThrow(z.ZodError);
      expect(() => PriorityEnum.parse('')).toThrow(z.ZodError);
    });
  });

  // 他のテストケース...
});
```

### ファイルサービスのテスト

```typescript
// tests/unit/services/file.service.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// モックの設定
vi.mock('../../../src/config/env.js', () => ({
  env: {
    DATA_DIR: TEST_DATA_DIR,
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    PORT: '3001',
  },
}));

// FileServiceのインポート
import { FileService } from '../../../src/services/file.service.js';

describe('FileService', () => {
  // テストケース...
});
```

### タスクサービスのテスト

```typescript
// tests/unit/services/task.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Task } from '../../../src/models/task.model.js';

// モックの設定
vi.mock('uuid', () => ({
  v4: () => 'mocked-uuid'
}));

// タスクサービスのインポート
import { TaskService } from '../../../src/services/task.service.js';
import { FileService } from '../../../src/services/file.service.js';

describe('TaskService', () => {
  // テストケース...
});
```

## 実装結果

フェーズ2の実装が完了しました。以下の機能が実装されています：

1. **データモデルの定義**
   - Zodを使用したタスクモデルのスキーマ定義
   - 型安全なタスクデータの操作
   - バリデーションルールの設定

2. **ファイルシステムを使用したデータ永続化サービス**
   - データディレクトリの自動作成
   - JSONファイルの読み書き
   - バックアップ機能
   - エラーハンドリング

3. **タスクサービス**
   - タスクのCRUD操作
   - タスク一覧・詳細取得
   - タスク作成・更新・削除
   - タスク完了状態の切り替え
   - カテゴリ一覧取得

4. **データ整合性の確保**
   - データバリデーション機能
   - データ修復機能
   - エラーハンドリングの強化

すべてのテストが正常に実行され、フェーズ2の実装が完了しました。

## 次のステップ

フェーズ3（APIエンドポイントの実装（基本機能））に進みます。
