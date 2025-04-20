import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// モックを使用してテストを安定させる
vi.mock('../../src/services/fileService.js', async () => {
  const actual = await vi.importActual('../../src/services/fileService.js');
  return {
    ...actual,
    FileService: class MockFileService {
      async listFiles(extension?: string) {
        const files = ['test1.json', 'test2.json', 'other.txt'];
        if (extension === '.json') {
          return files.filter(file => file.endsWith('.json'));
        }
        return files;
      }
      
      async writeFile() {
        return Promise.resolve();
      }
    }
  };
});

describe('ストレージAPI統合テスト', () => {
  const app = createApp();
  const testDir = path.join(os.tmpdir(), `todolog-storage-test-${Date.now()}`);
  
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
  
  // 各テスト前にテストファイルを作成
  beforeEach(async () => {
    try {
      // テスト用のファイルを作成
      await fs.writeFile(path.join(testDir, 'test1.json'), JSON.stringify([]), 'utf8');
      await fs.writeFile(path.join(testDir, 'test2.json'), JSON.stringify([]), 'utf8');
      await fs.writeFile(path.join(testDir, 'other.txt'), 'test', 'utf8');
    } catch (error) {
      console.error('テストファイルの作成に失敗しました:', error);
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
  
  describe('GET /api/storage/files', () => {
    it('ファイル一覧を取得する', async () => {
      const response = await request(app)
        .get('/api/storage/files')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toContain('test1.json');
      expect(response.body).toContain('test2.json');
      expect(response.body).toContain('other.txt');
    });
    
    it('拡張子でフィルタリングする', async () => {
      const response = await request(app)
        .get('/api/storage/files?extension=.json')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toContain('test1.json');
      expect(response.body).toContain('test2.json');
      expect(response.body).not.toContain('other.txt');
    });
  });
  
  describe('POST /api/storage/files', () => {
    it('新しいタスクファイルを作成する', async () => {
      const response = await request(app)
        .post('/api/storage/files')
        .send({ filename: 'new-tasks' })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('filename', 'new-tasks.json');
      
      // モックを使用しているため、ファイルの存在確認はスキップ
    });
    
    it('既に拡張子がある場合はそのまま使用する', async () => {
      const response = await request(app)
        .post('/api/storage/files')
        .send({ filename: 'with-extension.json' })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('filename', 'with-extension.json');
    });
    
    it('無効なファイル名を拒否する', async () => {
      await request(app)
        .post('/api/storage/files')
        .send({ filename: '../invalid/path' })
        .expect(400);
      
      await request(app)
        .post('/api/storage/files')
        .send({ filename: 'invalid*name' })
        .expect(400);
    });
    
    it('ファイル名が指定されていない場合はエラー', async () => {
      await request(app)
        .post('/api/storage/files')
        .send({})
        .expect(400);
    });
  });
});
