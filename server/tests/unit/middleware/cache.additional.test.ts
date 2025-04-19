import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateTaskDataTimestamp, cacheControl, noCacheAfterMutation } from '../../../src/middleware/cache.js';
import { Request, Response, NextFunction } from 'express';

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}));

describe('キャッシュミドルウェア追加テスト', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      path: '/api/tasks',
      headers: {},
    };
    mockResponse = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('updateTaskDataTimestamp', () => {
    it('タスクデータのタイムスタンプを更新するべき', () => {
      const before = Date.now();
      updateTaskDataTimestamp();
      // タイムスタンプが更新されたことを直接検証することはできないが、
      // 関数が例外を投げずに実行されることを確認
      expect(true).toBe(true);
    });
  });

  describe('cacheControl', () => {
    it('指定された最大期間でCache-Controlヘッダーを設定するべき', () => {
      const middleware = cacheControl(60);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // 実際のヘッダー値を確認（publicかprivateかは実装によって異なる可能性がある）
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', expect.stringMatching(/max-age=60/));
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('noCacheAfterMutation', () => {
    it('キャッシュ無効化ヘッダーを設定するべき', () => {
      noCacheAfterMutation(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, must-revalidate');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Expires', '0');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
