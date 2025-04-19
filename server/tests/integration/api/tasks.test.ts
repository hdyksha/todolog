// 環境変数のモック（最初に行う必要がある）
import { vi } from 'vitest';

// 環境変数のモック
vi.mock('../../../src/config/env.js', () => ({
  env: {
    DATA_DIR: './test-api-data',
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    PORT: '3001',
  },
}));

// 残りのインポート
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from '../../../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト用のデータディレクトリ
const TEST_DATA_DIR = path.join(__dirname, '../../../test-api-data');
const TEST_TASKS_FILE = path.join(TEST_DATA_DIR, 'tasks.json');

describe('タスクAPI', () => {
  const app = createApp();
  
  beforeEach(async () => {
    // テスト用ディレクトリの作成
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    // 空のタスクリストで初期化
    await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([]), 'utf-8');
  });
  
  afterEach(async () => {
    // テスト後のクリーンアップ
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error('テストディレクトリの削除に失敗しました', error);
    }
  });
  
  describe('GET /api/tasks', () => {
    it('空のタスクリストを返すべき', async () => {
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
    
    it('タスクリストを返すべき', async () => {
      // テスト用のタスクを作成
      const task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'テストタスク',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      
      await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([task]), 'utf-8');
      
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', task.id);
      expect(response.body[0]).toHaveProperty('title', task.title);
    });
  });
  
  describe('GET /api/tasks/:id', () => {
    it('存在するタスクを返すべき', async () => {
      // テスト用のタスクを作成
      const task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'テストタスク',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      
      await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([task]), 'utf-8');
      
      const response = await request(app).get(`/api/tasks/${task.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', task.id);
      expect(response.body).toHaveProperty('title', task.title);
    });
    
    it('存在しないタスクの場合は404を返すべき', async () => {
      const response = await request(app).get('/api/tasks/non-existent-id');
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/tasks', () => {
    it('新しいタスクを作成するべき', async () => {
      const newTask = {
        title: '新しいタスク',
        priority: 'high',
        category: 'テスト',
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', newTask.title);
      expect(response.body).toHaveProperty('priority', newTask.priority);
      expect(response.body).toHaveProperty('category', newTask.category);
      expect(response.body).toHaveProperty('completed', false);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      // ファイルに保存されていることを確認
      const fileContent = await fs.readFile(TEST_TASKS_FILE, 'utf-8');
      const savedTasks = JSON.parse(fileContent);
      
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0]).toHaveProperty('title', newTask.title);
    });
    
    it('無効なデータの場合は400を返すべき', async () => {
      const invalidTask = {
        // タイトルが欠けている
        priority: 'high',
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('PUT /api/tasks/:id', () => {
    it('タスクを更新するべき', async () => {
      // テスト用のタスクを作成
      const task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: '更新前のタスク',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      
      await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([task]), 'utf-8');
      
      const updateData = {
        title: '更新後のタスク',
        priority: 'high',
      };
      
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updateData)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', task.id);
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('priority', updateData.priority);
      
      // ファイルに保存されていることを確認
      const fileContent = await fs.readFile(TEST_TASKS_FILE, 'utf-8');
      const savedTasks = JSON.parse(fileContent);
      
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0]).toHaveProperty('title', updateData.title);
    });
    
    it('存在しないタスクの場合は404を返すべき', async () => {
      const updateData = {
        title: '更新後のタスク',
      };
      
      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .send(updateData)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(404);
    });
    
    it('無効なデータの場合は400を返すべき', async () => {
      // テスト用のタスクを作成
      const task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'テストタスク',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      
      await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([task]), 'utf-8');
      
      const invalidData = {
        title: '', // 空のタイトル
      };
      
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(invalidData)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('DELETE /api/tasks/:id', () => {
    it('タスクを削除するべき', async () => {
      // テスト用のタスクを作成
      const task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: '削除するタスク',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      
      await fs.writeFile(TEST_TASKS_FILE, JSON.stringify([task]), 'utf-8');
      
      const response = await request(app).delete(`/api/tasks/${task.id}`);
      
      expect(response.status).toBe(204);
      
      // ファイルから削除されていることを確認
      const fileContent = await fs.readFile(TEST_TASKS_FILE, 'utf-8');
      const savedTasks = JSON.parse(fileContent);
      
      expect(savedTasks).toHaveLength(0);
    });
    
    it('存在しないタスクの場合は404を返すべき', async () => {
      const response = await request(app).delete('/api/tasks/non-existent-id');
      
      expect(response.status).toBe(404);
    });
  });
});
