import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Task } from '../../../src/models/task.model.js';

// UUIDのモック
vi.mock('uuid', () => ({
  v4: () => 'mocked-uuid'
}));

// 現在時刻のモック
const mockDate = new Date('2025-01-01T00:00:00Z');
vi.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);

// FileServiceのモック
vi.mock('../../../src/services/file.service.js', () => {
  const mockTasks: Task[] = [];
  
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

// ロガーのモック
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// モックの後にインポート
import { TaskService } from '../../../src/services/task.service.js';
import { FileService } from '../../../src/services/file.service.js';

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
    
    expect(createdTask).toHaveProperty('id', 'mocked-uuid');
    expect(createdTask).toHaveProperty('title', 'テストタスク');
    expect(createdTask).toHaveProperty('priority', 'medium');
    expect(createdTask).toHaveProperty('completed', false);
    expect(createdTask).toHaveProperty('createdAt', mockDate.toISOString());
    expect(createdTask).toHaveProperty('updatedAt', mockDate.toISOString());
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
  
  it('存在しないIDの場合はnullを返すべき', async () => {
    const result = await taskService.getTaskById('non-existent-id');
    expect(result).toBeNull();
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
    expect(updatedTask).toHaveProperty('id', createdTask.id);
  });
  
  it('存在しないタスクの更新はnullを返すべき', async () => {
    const result = await taskService.updateTask('non-existent-id', { title: '更新テスト' });
    expect(result).toBeNull();
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
  
  it('存在しないタスクの削除はfalseを返すべき', async () => {
    const result = await taskService.deleteTask('non-existent-id');
    expect(result).toBe(false);
  });
  
  it('タスクの完了状態を切り替えられるべき', async () => {
    const taskData = {
      title: '完了状態テスト',
      completed: false,
    };
    
    const createdTask = await taskService.createTask(taskData);
    const toggledTask = await taskService.toggleTaskCompletion(createdTask.id);
    
    expect(toggledTask).toHaveProperty('completed', true);
    
    const toggledAgain = await taskService.toggleTaskCompletion(createdTask.id);
    expect(toggledAgain).toHaveProperty('completed', false);
  });
  
  it('カテゴリ一覧を取得できるべき', async () => {
    await taskService.createTask({ title: 'タスク1', category: 'カテゴリA' });
    await taskService.createTask({ title: 'タスク2', category: 'カテゴリB' });
    await taskService.createTask({ title: 'タスク3', category: 'カテゴリA' });
    
    const categories = await taskService.getCategories();
    
    expect(categories).toHaveLength(2);
    expect(categories).toContain('カテゴリA');
    expect(categories).toContain('カテゴリB');
  });
});
