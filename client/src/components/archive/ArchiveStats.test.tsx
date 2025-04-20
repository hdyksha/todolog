import React from 'react';
import { render, screen } from '@testing-library/react';
import ArchiveStats from './ArchiveStats';
import { ArchiveStats as ArchiveStatsType } from '../../hooks/useArchiveStats';

describe('ArchiveStats', () => {
  it('統計情報を正しく表示する', () => {
    const stats: ArchiveStatsType = {
      total: 42,
      today: 5,
      thisWeek: 12,
    };

    render(<ArchiveStats stats={stats} />);

    // 見出しが表示されるか確認
    expect(screen.getByText('アーカイブ統計')).toBeInTheDocument();

    // 各統計値が表示されるか確認
    expect(screen.getByText('5')).toBeInTheDocument(); // 今日完了
    expect(screen.getByText('12')).toBeInTheDocument(); // 今週完了
    expect(screen.getByText('42')).toBeInTheDocument(); // 合計完了

    // ラベルが表示されるか確認
    expect(screen.getByText('今日完了')).toBeInTheDocument();
    expect(screen.getByText('今週完了')).toBeInTheDocument();
    expect(screen.getByText('合計完了')).toBeInTheDocument();
  });

  it('値が0の場合も正しく表示する', () => {
    const stats: ArchiveStatsType = {
      total: 0,
      today: 0,
      thisWeek: 0,
    };

    render(<ArchiveStats stats={stats} />);

    // 各統計値が0として表示されるか確認
    const values = screen.getAllByText('0');
    expect(values).toHaveLength(3);
  });
});
