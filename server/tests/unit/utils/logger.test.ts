import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, requestLogger } from '../../../src/utils/logger.js';

describe('Logger', () => {
  it('loggerオブジェクトが存在するべき', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  describe('requestLogger', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = {
        method: 'GET',
        url: '/test',
      };
      
      res = {
        statusCode: 200,
        on: vi.fn((event, callback) => {
          if (event === 'finish') {
            callback();
          }
        }),
      };
      
      next = vi.fn();
      
      // loggerのinfoメソッドをモック化
      logger.info = vi.fn();
    });

    it('リクエストロガーがnext()を呼び出すべき', () => {
      requestLogger(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('レスポンス完了時にログを出力するべき', () => {
      requestLogger(req, res, next);
      
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({
        method: 'GET',
        url: '/test',
        status: 200,
        duration: expect.stringMatching(/\d+ms/),
      }));
    });
  });
});
