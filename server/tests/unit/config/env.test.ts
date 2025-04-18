import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('環境変数の設定', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    // 環境変数をクリア
    vi.resetModules();
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    // テスト後に環境変数を元に戻す
    process.env = originalEnv;
  });
  
  it('デフォルト値が設定されるべき', async () => {
    // 環境変数を削除
    delete process.env.PORT;
    delete process.env.DATA_DIR;
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
    
    // モジュールを再インポート
    const { env } = await import('../../../src/config/env.js');
    
    expect(env.PORT).toBe('3001');
    expect(env.DATA_DIR).toBe('./data');
    expect(env.NODE_ENV).toBe('development');
    expect(env.LOG_LEVEL).toBe('info');
  });
  
  it('環境変数が正しく読み込まれるべき', async () => {
    // 環境変数を設定
    process.env.PORT = '4000';
    process.env.DATA_DIR = './custom-data';
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'error';
    
    // モジュールを再インポート
    const { env } = await import('../../../src/config/env.js');
    
    expect(env.PORT).toBe('4000');
    expect(env.DATA_DIR).toBe('./custom-data');
    expect(env.NODE_ENV).toBe('production');
    expect(env.LOG_LEVEL).toBe('error');
  });
  
  it('無効な環境変数値を拒否するべき', async () => {
    // 無効な環境変数を設定
    process.env.NODE_ENV = 'invalid';
    process.env.LOG_LEVEL = 'invalid';
    
    // モジュールのインポートでエラーが発生することを確認
    await expect(import('../../../src/config/env.js')).rejects.toThrow();
  });
});
