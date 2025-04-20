import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { useArchiveStats } from '../../hooks/useArchiveStats';
import ArchiveHeader from './ArchiveHeader';
import TaskItem from '../TaskItem';
import './ArchiveSection.css';

interface ArchiveSectionProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onEditMemo?: (id: string) => void;
}

const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(settings.autoExpandArchive);
  const archiveStats = useArchiveStats(tasks);
  
  // アーカイブされたタスク（完了済みタスク）のみをフィルタリング
  const archivedTasks = tasks.filter(task => task.completed);
  
  // 設定が変更されたときに展開状態を更新
  useEffect(() => {
    setIsExpanded(settings.autoExpandArchive);
  }, [settings.autoExpandArchive]);
  
  // アーカイブ表示設定がオフの場合は何も表示しない
  if (!settings.showArchive) {
    return null;
  }

  return (
    <div className="archive-section">
      <ArchiveHeader
        archivedTasksCount={archivedTasks.length}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        stats={archiveStats}
      />
      
      {isExpanded && (
        <div className="archived-tasks">
          {archivedTasks.length === 0 ? (
            <p className="no-tasks">アーカイブされたタスクはありません</p>
          ) : (
            <div className="task-list">
              {archivedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isArchived={true}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onEditMemo={onEditMemo}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchiveSection;
