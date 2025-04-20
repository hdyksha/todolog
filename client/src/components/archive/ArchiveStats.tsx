import React from 'react';
import { ArchiveStats as ArchiveStatsType } from '../../hooks/useArchiveStats';
import './ArchiveStats.css';

interface ArchiveStatsProps {
  stats: ArchiveStatsType;
}

const ArchiveStats: React.FC<ArchiveStatsProps> = ({ stats }) => {
  return (
    <div className="archive-stats">
      <h3 className="archive-stats-title">アーカイブ統計</h3>
      <div className="archive-stats-grid">
        <div className="archive-stat-item">
          <span className="archive-stat-value">{stats.today}</span>
          <span className="archive-stat-label">今日完了</span>
        </div>
        <div className="archive-stat-item">
          <span className="archive-stat-value">{stats.thisWeek}</span>
          <span className="archive-stat-label">今週完了</span>
        </div>
        <div className="archive-stat-item">
          <span className="archive-stat-value">{stats.total}</span>
          <span className="archive-stat-label">合計完了</span>
        </div>
      </div>
    </div>
  );
};

export default ArchiveStats;
