import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { formatDate, isPastDate, isToday, isTomorrow, getRelativeDateLabel } from './date';

describe('日付ユーティリティ関数', () => {
  // 日付をモックして固定する
  beforeAll(() => {
    // 2025-04-19を現在の日付として固定
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-04-19T12:00:00.000Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('ISO形式の日付を正しくフォーマットする', () => {
      expect(formatDate('2025-05-01T00:00:00.000Z')).toBe('2025年05月01日');
      expect(formatDate('2025-05-01T00:00:00.000Z', 'yyyy/MM/dd')).toBe('2025/05/01');
    });

    it('無効な日付の場合は空文字列を返す', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('isPastDate', () => {
    it('過去の日付を正しく判定する', () => {
      expect(isPastDate('2025-04-18T00:00:00.000Z')).toBe(true);
      expect(isPastDate('2025-04-19T00:00:00.000Z')).toBe(false); // 今日
      expect(isPastDate('2025-04-20T00:00:00.000Z')).toBe(false); // 未来
    });

    it('無効な日付の場合はfalseを返す', () => {
      expect(isPastDate('invalid-date')).toBe(false);
      expect(isPastDate(undefined)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('今日の日付を正しく判定する', () => {
      expect(isToday('2025-04-19T00:00:00.000Z')).toBe(true);
      expect(isToday('2025-04-18T00:00:00.000Z')).toBe(false); // 昨日
      expect(isToday('2025-04-20T00:00:00.000Z')).toBe(false); // 明日
    });

    it('無効な日付の場合はfalseを返す', () => {
      expect(isToday('invalid-date')).toBe(false);
      expect(isToday(undefined)).toBe(false);
    });
  });

  describe('isTomorrow', () => {
    it('明日の日付を正しく判定する', () => {
      expect(isTomorrow('2025-04-20T00:00:00.000Z')).toBe(true);
      expect(isTomorrow('2025-04-19T00:00:00.000Z')).toBe(false); // 今日
      expect(isTomorrow('2025-04-21T00:00:00.000Z')).toBe(false); // 明後日
    });

    it('無効な日付の場合はfalseを返す', () => {
      expect(isTomorrow('invalid-date')).toBe(false);
      expect(isTomorrow(undefined)).toBe(false);
    });
  });

  describe('getRelativeDateLabel', () => {
    it('相対的な日付表現を正しく返す', () => {
      expect(getRelativeDateLabel('2025-04-18T00:00:00.000Z')).toBe('期限切れ');
      expect(getRelativeDateLabel('2025-04-19T00:00:00.000Z')).toBe('今日');
      expect(getRelativeDateLabel('2025-04-20T00:00:00.000Z')).toBe('明日');
      expect(getRelativeDateLabel('2025-05-01T00:00:00.000Z')).toBe('05/01');
    });

    it('無効な日付の場合は空文字列を返す', () => {
      expect(getRelativeDateLabel('invalid-date')).toBe('');
      expect(getRelativeDateLabel(undefined)).toBe('');
    });
  });
});
