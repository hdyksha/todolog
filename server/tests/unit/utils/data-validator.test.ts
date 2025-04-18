import { describe, it, expect, vi } from 'vitest';
import { validateTasksData, repairTasksData } from '../../../src/utils/data-validator.js';

// ロガーのモック
vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('データバリデーター', () => {
  describe('validateTasksData', () => {
    it('有効なタスク配列を検証できるべき', async () => {
      const validTasks = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'テストタスク1',
          completed: false,
          priority: 'medium',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'テストタスク2',
          completed: true,
          priority: 'high',
          category: 'テスト',
          dueDate: '2025-12-31T23:59:59Z',
          memo: 'これはテストです',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const result = await validateTasksData(validTasks);
      expect(result).toBe(true);
    });

    it('無効なタスク配列を拒否するべき', async () => {
      const invalidTasks = [
        {
          // idが欠けている
          title: 'テストタスク',
          completed: false,
          priority: 'medium',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const result = await validateTasksData(invalidTasks);
      expect(result).toBe(false);
    });

    it('配列でないデータを拒否するべき', async () => {
      const notAnArray = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'テストタスク',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = await validateTasksData(notAnArray);
      expect(result).toBe(false);
    });
  });

  describe('repairTasksData', () => {
    it('有効なタスクのみを保持するべき', async () => {
      const mixedTasks = [
        // 有効なタスク
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'テストタスク1',
          completed: false,
          priority: 'medium',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        // 無効なタスク（idが欠けている）
        {
          title: 'テストタスク2',
          completed: false,
          priority: 'medium',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const result = await repairTasksData(mixedTasks);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', '123e4567-e89b-12d3-a456-426614174000');
    });

    it('配列でないデータの場合は空配列を返すべき', async () => {
      const notAnArray = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'テストタスク',
        completed: false,
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = await repairTasksData(notAnArray);
      expect(result).toEqual([]);
    });

    it('空の配列を渡すと空の配列を返すべき', async () => {
      const emptyArray: any[] = [];
      const result = await repairTasksData(emptyArray);
      expect(result).toEqual([]);
    });
  });
});
