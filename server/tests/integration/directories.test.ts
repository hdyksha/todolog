import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('ディレクトリAPI統合テスト', () => {
  const app = createApp();
  const testDir = path.join(os.tmpdir(), `todolog-dir-test-${Date.now()}`);
  
  // テスト用のディレクトリを作成
  beforeAll(async () => {
    try {
      await fs.mkdir(testDir, { recursive: true });
      
      // 環境変数を設定（テスト用）
      process.env.DATA_DIR = testDir;
    } catch (error) {
      console.error('テスト用ディレクトリの作成に失敗しました:', error);
    }
  });
  
  // テスト用のディレクトリを削除
  afterAll(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      
      // 環境変数をリセット
      delete process.env.DATA_DIR;
    } catch (error) {
      console.error('テスト用ディレクトリの削除に失敗しました:', error);
    }
  });
  
  describe('GET /api/storage/directories', () => {
    it('利用可能なディレクトリ一覧を取得する', async () => {
      const response = await request(app)
        .get('/api/storage/directories')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      // 各ディレクトリオブジェクトの構造を確認
      response.body.forEach((dir: any) => {
        expect(dir).toHaveProperty('path');
        expect(dir).toHaveProperty('label');
        expect(dir).toHaveProperty('exists');
        expect(dir).toHaveProperty('writable');
      });
      
      // デフォルトディレクトリが含まれていることを確認
      const paths = response.body.map((dir: any) => dir.path);
      expect(paths).toContain('./data');
      expect(paths).toContain(path.join(os.homedir(), 'todolog'));
    });
  });
});
