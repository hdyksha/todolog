import { describe, it, expect } from 'vitest';
import { groupTasksByDate, formatDate } from './dateUtils';
import { Task, Priority } from '../types';

describe('dateUtils', () => {
  describe('groupTasksByDate', () => {
    it('completedAt に基づいてタスクをグループ化する', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'タスク1',
          completed: true,
          priority: Priority.Medium,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-05T15:00:00Z',
          completedAt: '2025-01-05T15:00:00Z',
        },
        {
          id: '2',
          title: 'タスク2',
          completed: true,
          priority: Priority.High,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-05T16:00:00Z',
          completedAt: '2025-01-05T16:00:00Z',
        },
        {
          id: '3',
          title: 'タスク3',
          completed: true,
          priority: Priority.Low,
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-06T10:00:00Z',
          completedAt: '2025-01-06T10:00:00Z',
        },
      ];
      
      const result = groupTasksByDate(tasks);
      
      // 日付ごとにグループ化されていることを確認
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['2025-01-05']).toHaveLength(2);
      expect(result['2025-01-06']).toHaveLength(1);
      
      // 正しいタスクがグループ化されていることを確認
      expect(result['2025-01-05'].map(task => task.id)).toEqual(['1', '2']);
      expect(result['2025-01-06'].map(task => task.id)).toEqual(['3']);
    });
    
    it('completedAt がない場合は updatedAt を使用する', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'タスク1',
          completed: true,
          priority: Priority.Medium,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-05T15:00:00Z',
          // completedAt は設定されていない
        },
        {
          id: '2',
          title: 'タスク2',
          completed: true,
          priority: Priority.High,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-06T16:00:00Z',
          completedAt: '2025-01-06T16:00:00Z',
        },
      ];
      
      const result = groupTasksByDate(tasks);
      
      // 日付ごとにグループ化されていることを確認
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['2025-01-05']).toHaveLength(1);
      expect(result['2025-01-06']).toHaveLength(1);
      
      // 正しいタスクがグループ化されていることを確認
      expect(result['2025-01-05'].map(task => task.id)).toEqual(['1']);
      expect(result['2025-01-06'].map(task => task.id)).toEqual(['2']);
    });
  });
  
  describe('formatDate', () => {
    it('日付を正しくフォーマットする', () => {
      const date = new Date('2025-01-01');
      expect(formatDate(date)).toBe('2025年1月1日（水）');
      
      const date2 = new Date('2025-12-31');
      expect(formatDate(date2)).toBe('2025年12月31日（水）');
      
      const date3 = new Date('2025-04-01');
      expect(formatDate(date3)).toBe('2025年4月1日（火）');
    });
  });
});
