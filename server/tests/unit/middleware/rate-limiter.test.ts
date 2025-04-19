import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupRateLimiter } from '../../../src/middleware/rate-limiter.js';
import { Express } from 'express';
import rateLimit from 'express-rate-limit';

// モック
vi.mock('express-rate-limit', () => {
  return {
    default: vi.fn().mockReturnValue(() => {})
  };
});

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}));

describe('レート制限ミドルウェア', () => {
  let mockApp: Partial<Express>;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    mockApp = {
      use: vi.fn(),
    };
    vi.clearAllMocks();
    
    // 元の環境変数を保存
    originalNodeEnv = process.env.NODE_ENV;
  });

  it('テスト環境ではレート制限を無効化するべき', () => {
    // テスト用に環境変数を設定
    process.env.NODE_ENV = 'test';
    
    setupRateLimiter(mockApp as Express);
    
    expect(mockApp.use).not.toHaveBeenCalled();
    expect(rateLimit).not.toHaveBeenCalled();
    
    // 環境変数を元に戻す
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('本番環境ではAPIルートにレート制限を適用するべき', () => {
    // テスト用に環境変数を設定
    process.env.NODE_ENV = 'production';
    
    setupRateLimiter(mockApp as Express);
    
    expect(rateLimit).toHaveBeenCalledTimes(2);
    expect(mockApp.use).toHaveBeenCalledTimes(2);
    expect(mockApp.use).toHaveBeenCalledWith('/api/', expect.any(Function));
    
    // 環境変数を元に戻す
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('開発環境でもレート制限を適用するべき', () => {
    // テスト用に環境変数を設定
    process.env.NODE_ENV = 'development';
    
    setupRateLimiter(mockApp as Express);
    
    expect(rateLimit).toHaveBeenCalledTimes(2);
    expect(mockApp.use).toHaveBeenCalledTimes(2);
    
    // 環境変数を元に戻す
    process.env.NODE_ENV = originalNodeEnv;
  });
});
