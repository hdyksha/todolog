import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, requestLogger } from '../../../src/utils/logger.js';
import { env } from '../../../src/config/env.js';

// envのモック
vi.mock('../../../src/config/env.js', () => ({
  env: {
    LOG_LEVEL: 'info',
    NODE_ENV: 'test'
  }
}));

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
    let logSpy;

    beforeEach(() => {
      req = {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        query: {}
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
      
      // loggerのlogメソッドをモック化
      logSpy = vi.spyOn(logger, 'log').mockImplementation(() => {});
      vi.spyOn(logger, 'debug').mockImplementation(() => {});
      vi.spyOn(logger, 'info').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('リクエストロガーがnext()を呼び出すべき', () => {
      requestLogger(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('レスポンス完了時にログを出力するべき', () => {
      requestLogger(req, res, next);
      
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(logSpy).toHaveBeenCalledWith('info', expect.objectContaining({
        message: expect.stringContaining('GET /test 200'),
        method: 'GET',
        url: '/test',
        status: 200,
        duration: expect.stringMatching(/\d+ms/),
      }));
    });
  });
});
