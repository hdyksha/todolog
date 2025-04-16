import React from 'react';

interface ArchiveHeaderProps {
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}

const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({
  count,
  isOpen,
  onToggle
}) => {
  return (
    <div className="archive-header" onClick={onToggle}>
      <h2>アーカイブ済みタスク ({count})</h2>
      <span className={`toggle-icon ${isOpen ? 'open' : 'closed'}`}>
        {isOpen ? '▼' : '▶'}
      </span>
    </div>
  );
};

export default ArchiveHeader;
