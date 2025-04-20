import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { ArchiveStats as ArchiveStatsType } from '../../hooks/useArchiveStats';
import ArchiveStats from './ArchiveStats';
import './ArchiveHeader.css';

interface ArchiveHeaderProps {
  archivedTasksCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  stats: ArchiveStatsType;
}

const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  archivedTasksCount,
  isExpanded,
  onToggleExpand,
  stats,
}) => {
  const { settings } = useSettings();

  return (
    <div className="archive-header-container">
      <div 
        className="archive-header"
        onClick={onToggleExpand}
      >
        <h2 className="section-title">アーカイブ済み ({archivedTasksCount})</h2>
        <button className="toggle-button" aria-label={isExpanded ? 'アーカイブを折りたたむ' : 'アーカイブを展開する'}>
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && settings.showArchiveStats && <ArchiveStats stats={stats} />}
    </div>
  );
};

export default ArchiveHeader;
