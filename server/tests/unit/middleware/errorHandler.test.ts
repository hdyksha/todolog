import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notFoundHandler, errorHandler } from '../../../src/middleware/errorHandler.js';
import { logger } from '../../../src/utils/logger.js';

// loggerのモック
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(), // warn関数を追加
  },
}));

describe('Error Handlers', () => {
  describe('notFoundHandler', () => {
    let req;
    let res;

    beforeEach(() => {
      req = {
        originalUrl: '/test/not-found',
      };
      
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
    });

    it('404ステータスコードを返すべき', () => {
      notFoundHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('エラーメッセージを含むJSONを返すべき', () => {
      notFoundHandler(req, res);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'NOT_FOUND',
          message: expect.stringContaining('/test/not-found'),
        }
      });
    });
  });

  describe('errorHandler', () => {
    let err;
    let req;
    let res;
    let next;

    beforeEach(() => {
      err = new Error('テストエラー');
      
      req = {
        path: '/test',
        method: 'GET',
      };
      
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      
      next = vi.fn();
      
      // NODE_ENVをリセット
      process.env.NODE_ENV = 'development';
    });

    it('エラーをログに記録するべき', () => {
      errorHandler(err, req, res, next);
      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({
        message: 'テストエラー',
        path: '/test',
        method: 'GET',
      }));
    });

    it('500ステータスコードを返すべき', () => {
      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('開発環境では実際のエラーメッセージを返すべき', () => {
      process.env.NODE_ENV = 'development';
      errorHandler(err, req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'テストエラー',
        }
      });
    });

    it('本番環境ではジェネリックなエラーメッセージを返すべき', () => {
      process.env.NODE_ENV = 'production';
      errorHandler(err, req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '内部サーバーエラーが発生しました',
        }
      });
    });
  });
});
