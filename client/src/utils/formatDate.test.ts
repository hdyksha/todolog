import { describe, it, expect } from 'vitest';
import { formatDate } from './index';

describe('formatDate ユーティリティ', () => {
  it('デフォルトフォーマット (YYYY-MM-DD) で日付をフォーマットする', () => {
    const date = new Date(2025, 3, 15); // 2025-04-15
    expect(formatDate(date)).toBe('2025-04-15');
  });

  it('カスタムフォーマットで日付をフォーマットする', () => {
    const date = new Date(2025, 3, 15, 14, 30, 45); // 2025-04-15 14:30:45
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2025/04/15');
    expect(formatDate(date, 'MM/DD/YYYY')).toBe('04/15/2025');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm')).toBe('2025-04-15 14:30');
    expect(formatDate(date, 'HH:mm:ss')).toBe('14:30:45');
  });

  it('日付文字列を受け入れる', () => {
    expect(formatDate('2025-04-15')).toBe('2025-04-15');
    expect(formatDate('2025-04-15T14:30:45', 'YYYY/MM/DD HH:mm')).toBe('2025/04/15 14:30');
  });

  it('無効な日付の場合は空文字列を返す', () => {
    expect(formatDate('invalid-date')).toBe('');
  });

  it('月と日が1桁の場合にゼロパディングする', () => {
    const date = new Date(2025, 0, 5); // 2025-01-05
    expect(formatDate(date)).toBe('2025-01-05');
  });
});
