import { describe, it, expect } from 'vitest';
import { groupTasksByDate, formatDate } from './dateUtils';
import { Task, Priority } from '../types';

describe('dateUtils', () => {
  describe('groupTasksByDate', () => {
    it('空の配列を渡すと空のオブジェクトを返す', () => {
      const result = groupTasksByDate([]);
      expect(result).toEqual({});
    });

    it('タスクを日付ごとに正しくグループ化する', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'タスク1',
          completed: true,
          priority: Priority.Medium,
          createdAt: '2025-04-20T10:00:00.000Z',
          updatedAt: '2025-04-20T15:00:00.000Z',
        },
        {
          id: '2',
          title: 'タスク2',
          completed: true,
          priority: Priority.High,
          createdAt: '2025-04-19T10:00:00.000Z',
          updatedAt: '2025-04-20T16:00:00.000Z',
        },
        {
          id: '3',
          title: 'タスク3',
          completed: true,
          priority: Priority.Low,
          createdAt: '2025-04-18T10:00:00.000Z',
          updatedAt: '2025-04-19T12:00:00.000Z',
        },
      ];

      const result = groupTasksByDate(tasks);
      
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['2025-04-20']).toHaveLength(2);
      expect(result['2025-04-19']).toHaveLength(1);
      expect(result['2025-04-20'].map(t => t.id)).toContain('1');
      expect(result['2025-04-20'].map(t => t.id)).toContain('2');
      expect(result['2025-04-19'].map(t => t.id)).toContain('3');
    });
  });

  describe('formatDate', () => {
    it('日付を正しくフォーマットする', () => {
      const date = new Date('2025-04-20T12:00:00.000Z');
      const result = formatDate(date);
      
      // タイムゾーンによって結果が変わるため、部分的な検証を行う
      expect(result).toContain('2025年');
      expect(result).toMatch(/\d+月\d+日/);
      expect(result).toMatch(/（[日月火水木金土]）/);
    });
  });
});
