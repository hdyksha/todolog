import { describe, it, expect } from 'vitest';
import { CreateTaskSchema, UpdateTaskSchema, TaskSchema, PriorityEnum } from '../../../src/models/task.model.js';
import { z } from 'zod';

describe('タスクモデル', () => {
  describe('PriorityEnum', () => {
    it('有効な優先度値を受け入れるべき', () => {
      expect(PriorityEnum.parse('high')).toBe('high');
      expect(PriorityEnum.parse('medium')).toBe('medium');
      expect(PriorityEnum.parse('low')).toBe('low');
    });

    it('無効な優先度値を拒否するべき', () => {
      expect(() => PriorityEnum.parse('invalid')).toThrow(z.ZodError);
      expect(() => PriorityEnum.parse('')).toThrow(z.ZodError);
    });
  });

  describe('CreateTaskSchema', () => {
    it('有効なタスクデータを受け入れるべき', () => {
      const validTask = {
        title: 'テストタスク',
        priority: 'medium' as const,
        completed: false,
        category: 'テスト',
        dueDate: '2025-12-31T23:59:59Z',
        memo: 'これはテストです',
      };

      const result = CreateTaskSchema.parse(validTask);
      expect(result).toEqual(validTask);
    });

    it('必須フィールドのみでも受け入れるべき', () => {
      const minimalTask = {
        title: 'テストタスク',
      };

      const result = CreateTaskSchema.parse(minimalTask);
      expect(result).toHaveProperty('title', 'テストタスク');
      expect(result).toHaveProperty('completed', false); // デフォルト値
      expect(result).toHaveProperty('priority', 'medium'); // デフォルト値
    });

    it('タイトルが空の場合はエラーを投げるべき', () => {
      const invalidTask = {
        title: '',
        priority: 'medium' as const,
      };

      expect(() => CreateTaskSchema.parse(invalidTask)).toThrow(z.ZodError);
    });

    it('無効な日付形式を拒否するべき', () => {
      const invalidTask = {
        title: 'テストタスク',
        dueDate: 'invalid-date',
      };

      expect(() => CreateTaskSchema.parse(invalidTask)).toThrow(z.ZodError);
    });
  });

  describe('UpdateTaskSchema', () => {
    it('部分的な更新データを受け入れるべき', () => {
      const partialUpdate = {
        title: '更新されたタイトル',
      };

      const result = UpdateTaskSchema.parse(partialUpdate);
      expect(result).toEqual(partialUpdate);
    });

    it('空のオブジェクトも受け入れるべき', () => {
      const emptyUpdate = {};

      const result = UpdateTaskSchema.parse(emptyUpdate);
      expect(result).toEqual({});
    });

    it('無効なフィールド値を拒否するべき', () => {
      const invalidUpdate = {
        title: '', // 空のタイトル
      };

      expect(() => UpdateTaskSchema.parse(invalidUpdate)).toThrow(z.ZodError);
    });
  });

  describe('TaskSchema', () => {
    it('完全なタスクデータを受け入れるべき', () => {
      const completeTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'テストタスク',
        completed: false,
        priority: 'high' as const,
        category: 'テスト',
        dueDate: '2025-12-31T23:59:59Z',
        memo: 'これはテストです',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = TaskSchema.parse(completeTask);
      expect(result).toEqual(completeTask);
    });

    it('必須フィールドが欠けている場合はエラーを投げるべき', () => {
      const incompleteTask = {
        title: 'テストタスク',
        completed: false,
        priority: 'medium' as const,
        // id, createdAt, updatedAtが欠けている
      };

      expect(() => TaskSchema.parse(incompleteTask)).toThrow(z.ZodError);
    });

    it('無効なUUID形式を拒否するべき', () => {
      const invalidIdTask = {
        id: 'not-a-uuid',
        title: 'テストタスク',
        completed: false,
        priority: 'medium' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      expect(() => TaskSchema.parse(invalidIdTask)).toThrow(z.ZodError);
    });

    it('無効な日時形式を拒否するべき', () => {
      const invalidDateTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'テストタスク',
        completed: false,
        priority: 'medium' as const,
        createdAt: 'not-a-date',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      expect(() => TaskSchema.parse(invalidDateTask)).toThrow(z.ZodError);
    });
  });
});
