import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskController } from '../../../src/controllers/taskController.js';
import { TaskService } from '../../../src/services/taskService.js';
import { Task } from '../../../src/models/task.model.js';
import { Request, Response } from 'express';

// キャッシュミドルウェアのモック
vi.mock('../../../src/middleware/cache.js', () => ({
  updateTaskDataTimestamp: vi.fn(),
}));

// TaskServiceのモック
const mockTaskService = {
  getAllTasks: vi.fn(),
  getTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  toggleTaskCompletion: vi.fn(),
  updateTaskMemo: vi.fn(),
  getCategories: vi.fn(),
  createBackup: vi.fn(),
  listBackups: vi.fn(),
  restoreFromBackup: vi.fn(),
  exportTasks: vi.fn(),
  importTasks: vi.fn(),
} as unknown as TaskService;

// リクエスト、レスポンス、ネクストのモック
const mockRequest = () => {
  return {
    params: {},
    body: {},
    query: {},
  } as Request;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

describe('TaskController', () => {
  let taskController: TaskController;
  
  beforeEach(() => {
    taskController = new TaskController(mockTaskService);
    vi.clearAllMocks();
  });
  
  describe('getAllTasks', () => {
    it('タスク一覧を返すべき', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'テストタスク1',
          completed: false,
          priority: 'medium',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'テストタスク2',
          completed: true,
          priority: 'high',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];
      
      mockTaskService.getAllTasks.mockResolvedValue(mockTasks);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await taskController.getAllTasks(req, res, mockNext);
      
      expect(mockTaskService.getAllTasks).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTasks);
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, max-age=10');
    });
    
    it('エラーが発生した場合はnextを呼び出すべき', async () => {
      const error = new Error('テストエラー');
      mockTaskService.getAllTasks.mockRejectedValue(error);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await taskController.getAllTasks(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getTaskById', () => {
    it('存在するタスクを返すべき', async () => {
      const mockTask: Task = {
        id: '1',
        title: 'テストタスク',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      
      mockTaskService.getTaskById.mockResolvedValue(mockTask);
      
      const req = mockRequest();
      req.params.id = '1';
      const res = mockResponse();
      
      await taskController.getTaskById(req, res, mockNext);
      
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, max-age=30');
    });
    
    it('存在しないタスクの場合はエラーを返すべき', async () => {
      mockTaskService.getTaskById.mockResolvedValue(null);
      
      const req = mockRequest();
      req.params.id = 'non-existent-id';
      const res = mockResponse();
      
      await taskController.getTaskById(req, res, mockNext);
      
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('non-existent-id');
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toContain('のタスクが見つかりません');
    });
  });
  
  describe('createTask', () => {
    it('新しいタスクを作成するべき', async () => {
      const taskData = {
        title: '新しいタスク',
        priority: 'high' as const,
      };
      
      const createdTask: Task = {
        ...taskData,
        id: 'new-id',
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      
      mockTaskService.createTask.mockResolvedValue(createdTask);
      
      const req = mockRequest();
      req.body = taskData;
      const res = mockResponse();
      
      await taskController.createTask(req, res, mockNext);
      
      expect(mockTaskService.createTask).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdTask);
    });
  });
  
  describe('updateTask', () => {
    it('タスクを更新するべき', async () => {
      const taskId = '1';
      const updateData = {
        title: '更新されたタスク',
        priority: 'low' as const,
      };
      
      const updatedTask: Task = {
        id: taskId,
        title: updateData.title,
        priority: updateData.priority,
        completed: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      
      mockTaskService.updateTask.mockResolvedValue(updatedTask);
      
      const req = mockRequest();
      req.params.id = taskId;
      req.body = updateData;
      const res = mockResponse();
      
      await taskController.updateTask(req, res, mockNext);
      
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedTask);
    });
    
    it('存在しないタスクの場合はエラーを返すべき', async () => {
      const taskId = 'non-existent-id';
      const updateData = {
        title: '更新されたタスク',
      };
      
      mockTaskService.updateTask.mockResolvedValue(null);
      
      const req = mockRequest();
      req.params.id = taskId;
      req.body = updateData;
      const res = mockResponse();
      
      await taskController.updateTask(req, res, mockNext);
      
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskId, updateData);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toContain('のタスクが見つかりません');
    });
  });
  
  describe('deleteTask', () => {
    it('タスクを削除するべき', async () => {
      const taskId = '1';
      
      mockTaskService.deleteTask.mockResolvedValue(true);
      
      const req = mockRequest();
      req.params.id = taskId;
      const res = mockResponse();
      
      await taskController.deleteTask(req, res, mockNext);
      
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });
    
    it('存在しないタスクの場合はエラーを返すべき', async () => {
      const taskId = 'non-existent-id';
      
      mockTaskService.deleteTask.mockResolvedValue(false);
      
      const req = mockRequest();
      req.params.id = taskId;
      const res = mockResponse();
      
      await taskController.deleteTask(req, res, mockNext);
      
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toContain('のタスクが見つかりません');
    });
  });
});
