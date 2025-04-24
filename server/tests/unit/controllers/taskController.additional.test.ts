import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskController } from '../../../src/controllers/taskController.js';
import { TaskService } from '../../../src/services/taskService.js';
import { Request, Response } from 'express';

// モック
vi.mock('../../../src/services/taskService.js');
vi.mock('../../../src/middleware/cache.js', () => ({
  updateTaskDataTimestamp: vi.fn(),
}));

describe('TaskController追加テスト', () => {
  let taskController: TaskController;
  let mockTaskService: TaskService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    mockTaskService = {
      toggleTaskCompletion: vi.fn(),
      updateTaskMemo: vi.fn(),
      getTags: vi.fn(),
      createBackup: vi.fn(),
      listBackups: vi.fn(),
      restoreFromBackup: vi.fn(),
      importTasks: vi.fn(),
    } as unknown as TaskService;

    taskController = new TaskController(mockTaskService);

    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      end: vi.fn(),
      setHeader: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('toggleTaskCompletion', () => {
    it('タスクの完了状態を切り替えるべき', async () => {
      const mockTask = { id: '123', title: 'テストタスク', completed: true };
      mockRequest.params = { id: '123' };
      vi.mocked(mockTaskService.toggleTaskCompletion).mockResolvedValue(mockTask);

      await taskController.toggleTaskCompletion(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.toggleTaskCompletion).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTask);
    });

    it('存在しないタスクの場合はエラーを返すべき', async () => {
      mockRequest.params = { id: 'non-existent' };
      vi.mocked(mockTaskService.toggleTaskCompletion).mockResolvedValue(null);

      await taskController.toggleTaskCompletion(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('updateTaskMemo', () => {
    it('タスクのメモを更新するべき', async () => {
      const mockTask = { id: '123', title: 'テストタスク', memo: '更新されたメモ' };
      mockRequest.params = { id: '123' };
      mockRequest.body = { memo: '更新されたメモ' };
      vi.mocked(mockTaskService.updateTaskMemo).mockResolvedValue(mockTask);

      await taskController.updateTaskMemo(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.updateTaskMemo).toHaveBeenCalledWith('123', '更新されたメモ');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTask);
    });

    it('存在しないタスクの場合はエラーを返すべき', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = { memo: 'メモ' };
      vi.mocked(mockTaskService.updateTaskMemo).mockResolvedValue(null);

      await taskController.updateTaskMemo(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('getTags', () => {
    it('タグ一覧を取得するべき', async () => {
      const mockTags = ['仕事', '個人', '買い物'];
      vi.mocked(mockTaskService.getTags).mockResolvedValue(mockTags);

      await taskController.getTags(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.getTags).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTags);
    });
  });

  describe('createBackup', () => {
    it('バックアップを作成するべき', async () => {
      const backupFilename = 'tasks.2025-04-19.bak';
      vi.mocked(mockTaskService.createBackup).mockResolvedValue(backupFilename);

      await taskController.createBackup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.createBackup).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ filename: backupFilename });
    });
  });

  describe('listBackups', () => {
    it('バックアップ一覧を取得するべき', async () => {
      const mockBackups = ['tasks.2025-04-18.bak', 'tasks.2025-04-19.bak'];
      vi.mocked(mockTaskService.listBackups).mockResolvedValue(mockBackups);

      await taskController.listBackups(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.listBackups).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBackups);
    });
  });

  describe('restoreFromBackup', () => {
    it('バックアップから復元するべき', async () => {
      mockRequest.params = { filename: 'tasks.2025-04-19.bak' };
      vi.mocked(mockTaskService.restoreFromBackup).mockResolvedValue(undefined);

      await taskController.restoreFromBackup(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.restoreFromBackup).toHaveBeenCalledWith('tasks.2025-04-19.bak');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'バックアップから復元しました' });
    });
  });

  describe('importTasks', () => {
    it('タスクデータをインポートするべき', async () => {
      const mockTasks = [
        { id: '1', title: 'タスク1', completed: false },
        { id: '2', title: 'タスク2', completed: true },
      ];
      mockRequest.body = mockTasks;
      vi.mocked(mockTaskService.importTasks).mockResolvedValue(undefined);

      await taskController.importTasks(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockTaskService.importTasks).toHaveBeenCalledWith(mockTasks);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'タスクデータをインポートしました' });
    });

    it('配列でないデータの場合はエラーを返すべき', async () => {
      mockRequest.body = { notAnArray: true };

      await taskController.importTasks(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
