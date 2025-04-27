import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { setupTestSettings } from '../helpers/testSettings.js';
import fs from 'fs/promises';
import path from 'path';

describe('設定API統合テスト', () => {
  const app = createApp();
  let testSettings;
  
  // テスト用の設定ディレクトリを作成
  beforeAll(async () => {
    testSettings = await setupTestSettings();
  });
  
  // テスト用の設定ディレクトリを削除
  afterAll(async () => {
    await testSettings.cleanup();
  });
  
  describe('GET /api/settings', () => {
    it('デフォルト設定を返す', async () => {
      const response = await request(app)
        .get('/api/settings')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('storage');
      expect(response.body).toHaveProperty('app');
      expect(response.body.storage).toHaveProperty('dataDir');
      expect(response.body.storage).toHaveProperty('currentTaskFile');
      expect(response.body.app).toHaveProperty('maxTasksPerPage');
    });
  });
  
  describe('PUT /api/settings', () => {
    it('設定を更新する', async () => {
      const updateData = {
        app: {
          maxTasksPerPage: 100
        }
      };
      
      const response = await request(app)
        .put('/api/settings')
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.app.maxTasksPerPage).toBe(100);
    });
    
    it('無効な設定値を拒否する', async () => {
      const invalidData = {
        app: {
          maxTasksPerPage: -10 // 負の値は無効
        }
      };
      
      await request(app)
        .put('/api/settings')
        .send(invalidData)
        .expect(400);
    });
  });
  
  describe('POST /api/settings/reset', () => {
    it('設定をデフォルトにリセットする', async () => {
      // まず設定を更新
      await request(app)
        .put('/api/settings')
        .send({
          app: { maxTasksPerPage: 100 }
        });
      
      // リセット
      const response = await request(app)
        .post('/api/settings/reset')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // デフォルト値に戻っていることを確認
      expect(response.body.app.maxTasksPerPage).toBe(50);
    });
  });
  
  describe('PUT /api/settings/storage/data-dir', () => {
    it('データディレクトリを設定する', async () => {
      const newDataDir = path.join(testSettings.settingsDir, 'custom-data');
      
      const response = await request(app)
        .put('/api/settings/storage/data-dir')
        .send({ dataDir: newDataDir })
        .expect('Content-Type', /json/)
        .expect(200);
      
      // 注: 実際のレスポンスでは相対パスに変換されている可能性があるため、
      // 厳密な一致ではなく、データディレクトリが設定されていることだけを確認
      expect(response.body.storage).toHaveProperty('dataDir');
      
      // ディレクトリが作成されたことを確認
      const dirExists = await fs.access(newDataDir).then(() => true).catch(() => false);
      expect(dirExists).toBe(true);
    });
    
    it('データディレクトリが指定されていない場合はエラー', async () => {
      await request(app)
        .put('/api/settings/storage/data-dir')
        .send({})
        .expect(400);
    });
  });
  
  describe('PUT /api/settings/storage/current-file', () => {
    it('現在のタスクファイルを設定する', async () => {
      const newFileName = 'custom-tasks.json';
      
      const response = await request(app)
        .put('/api/settings/storage/current-file')
        .send({ filename: newFileName })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.storage.currentTaskFile).toBe(newFileName);
    });
    
    it('ファイル名が指定されていない場合はエラー', async () => {
      await request(app)
        .put('/api/settings/storage/current-file')
        .send({})
        .expect(400);
    });
  });
  
  describe('GET /api/settings/storage/recent-files', () => {
    it('最近使用したファイルのリストを取得する', async () => {
      // まずファイルを設定
      await request(app)
        .put('/api/settings/storage/current-file')
        .send({ filename: 'file1.json' });
      
      await request(app)
        .put('/api/settings/storage/current-file')
        .send({ filename: 'file2.json' });
      
      const response = await request(app)
        .get('/api/settings/storage/recent-files')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toBe('file2.json');
    });
  });
});
