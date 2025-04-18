import { describe, it, expect } from 'vitest';
import { createApp } from '../../src/app.js';
import request from 'supertest';

describe('ヘルスチェックエンドポイント', () => {
  const app = createApp();

  it('GET /health が200を返すべき', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
