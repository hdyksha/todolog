import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Task } from '../../../src/models/task.model.js';
import { TaskService } from '../../../src/services/taskService.js';

// UUIDのモック
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mocked-uuid')
}));

// ロガーのモック
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('TaskService', () => {
  // 現在時刻のモック
  const mockDate = new Date('2025-01-01T00:00:00Z');
  const originalDate = global.Date;
  
  // FileServiceのモック
  const mockTasks: Task[] = [];
  const mockFileService = {
    readFile: vi.fn().mockImplementation((filename: string, defaultValue: any) => {
      if (filename === 'tasks.json') {
        return Promise.resolve([...mockTasks]);
      }
      return Promise.resolve(defaultValue);
    }),
    writeFile: vi.fn().mockImplementation((filename: string, data: any) => {
      if (filename === 'tasks.json') {
        mockTasks.length = 0;
        mockTasks.push(...data);
      }
      return Promise.resolve();
    }),
    createBackup: vi.fn().mockResolvedValue('backup-filename'),
    restoreFromBackup: vi.fn().mockResolvedValue(undefined),
    listBackups: vi.fn().mockResolvedValue(['backup1', 'backup2']),
  };

  let taskService: TaskService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTasks.length = 0;
    
    // Dateのモック
    global.Date = vi.fn(() => mockDate) as any;
    global.Date.now = vi.fn(() => mockDate.getTime());
    global.Date.parse = originalDate.parse;
    global.Date.UTC = originalDate.UTC;
    global.Date.prototype = originalDate.prototype;
    
    taskService = new TaskService(mockFileService as any);
  });

  afterEach(() => {
    global.Date = originalDate;
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
    expect(toggledTask).toHaveProperty('completedAt', mockDate.toISOString());
    
    const toggledAgain = await taskService.toggleTaskCompletion(createdTask.id);
    expect(toggledAgain).toHaveProperty('completed', false);
    expect(toggledAgain).toHaveProperty('completedAt', null);
  });
  
  it('タグでタスクをフィルタリングできるべき', async () => {
    await taskService.createTask({ title: 'タスク1', tags: ['タグA'] });
    await taskService.createTask({ title: 'タスク2', tags: ['タグB'] });
    await taskService.createTask({ title: 'タスク3', tags: ['タグA', 'タグC'] });
    
    const tasksWithTagA = await taskService.getAllTasks({ tags: ['タグA'] });
    expect(tasksWithTagA).toHaveLength(2);
    
    const tasksWithTagB = await taskService.getAllTasks({ tags: ['タグB'] });
    expect(tasksWithTagB).toHaveLength(1);
    
    const tasksWithTagC = await taskService.getAllTasks({ tags: ['タグC'] });
    expect(tasksWithTagC).toHaveLength(1);
  });
});
