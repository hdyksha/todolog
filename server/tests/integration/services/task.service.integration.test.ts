import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト用のデータディレクトリ
const TEST_DATA_DIR = path.join(__dirname, '../../../test-integration-data');
const TEST_TASKS_FILE = path.join(TEST_DATA_DIR, 'tasks.json');

// 環境変数の設定
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.NODE_ENV = 'test';

// モジュールのインポートは環境変数設定後に行う
import { TaskService } from '../../../src/services/task.service.js';
import { FileService } from '../../../src/services/file.service.js';

describe('TaskService統合テスト', () => {
  let fileService: FileService;
  let taskService: TaskService;
  
  beforeAll(async () => {
    // テスト用ディレクトリの作成
    try {
      await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
    }
  });
  
  beforeEach(async () => {
    // テスト用データファイルの初期化
    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([]), 'utf-8');
    
    // サービスの初期化
    fileService = new FileService();
    taskService = new TaskService(fileService);
  });
  
  afterAll(async () => {
    // テスト用ディレクトリの削除
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error('テストディレクトリの削除に失敗しました', error);
    }
  });
  
  it('タスクを作成して永続化できるべき', async () => {
    const taskData = {
      title: '統合テスト用タスク',
      priority: 'high' as const,
      category: 'テスト',
    };
    
    const createdTask = await taskService.createTask(taskData);
    
    // ファイルから直接読み込んで確認
    const fileContent = await fs.readFile(TEST_TASKS_FILE, 'utf-8');
    const savedTasks = JSON.parse(fileContent);
    
    expect(savedTasks).toHaveLength(1);
    expect(savedTasks[0]).toHaveProperty('id', createdTask.id);
    expect(savedTasks[0]).toHaveProperty('title', '統合テスト用タスク');
  });
  
  it('タスクを更新して永続化できるべき', async () => {
    // タスクを作成
    const createdTask = await taskService.createTask({
      title: '更新前のタスク',
      priority: 'medium' as const,
    });
    
    // タスクを更新
    await taskService.updateTask(createdTask.id, {
      title: '更新された統合テスト用タスク',
      memo: 'これは更新されたメモです',
    });
    
    // ファイルから直接読み込んで確認
    const fileContent = await fs.readFile(TEST_TASKS_FILE, 'utf-8');
    const savedTasks = JSON.parse(fileContent);
    
    expect(savedTasks[0]).toHaveProperty('title', '更新された統合テスト用タスク');
    expect(savedTasks[0]).toHaveProperty('memo', 'これは更新されたメモです');
  });
  
  it('タスクを削除して永続化できるべき', async () => {
    // タスクを作成
    const createdTask = await taskService.createTask({
      title: '削除するタスク',
    });
    
    // タスクを削除
    await taskService.deleteTask(createdTask.id);
    
    // ファイルから直接読み込んで確認
    const fileContent = await fs.readFile(TEST_TASKS_FILE, 'utf-8');
    const savedTasks = JSON.parse(fileContent);
    
    expect(savedTasks).toHaveLength(0);
  });
  
  it('複数のタスクを作成して取得できるべき', async () => {
    // 複数のタスクを作成
    await taskService.createTask({ title: 'タスク1', category: 'カテゴリA' });
    await taskService.createTask({ title: 'タスク2', category: 'カテゴリB' });
    await taskService.createTask({ title: 'タスク3', category: 'カテゴリA' });
    
    // タスク一覧を取得
    const tasks = await taskService.getAllTasks();
    
    expect(tasks).toHaveLength(3);
    
    // カテゴリ一覧を取得
    const categories = await taskService.getCategories();
    
    expect(categories).toHaveLength(2);
    expect(categories).toContain('カテゴリA');
    expect(categories).toContain('カテゴリB');
  });
});
