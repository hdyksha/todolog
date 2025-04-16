import React from 'react';
import { Task } from '../../types/Task';
import ArchiveHeader from './ArchiveHeader';
import TaskList from '../TaskList/TaskList';

// 日付ごとにグループ化されたタスクの型
interface TasksByDate {
  [date: string]: Task[];
}

interface ArchiveSectionProps {
  archivedTasks: TasksByDate;
  showArchived: boolean;
  isLoading: boolean;
  onToggleVisibility: () => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  archivedTasks,
  showArchived,
  isLoading,
  onToggleVisibility,
  onToggleTask,
  onDeleteTask,
}) => {
  // アーカイブのタスク数を計算
  const countArchivedTasks = () => {
    return Object.values(archivedTasks).reduce((count, tasks) => count + tasks.length, 0);
  };

  const archivedCount = countArchivedTasks();

  if (archivedCount === 0) {
    return null;
  }

  return (
    <div className="archive-section">
      <ArchiveHeader count={archivedCount} isOpen={showArchived} onToggle={onToggleVisibility} />

      {showArchived && (
        <TaskList
          tasksByDate={archivedTasks}
          isLoading={isLoading}
          isArchived={true}
          emptyMessage="アーカイブされたタスクはありません"
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
        />
      )}
    </div>
  );
};

export default ArchiveSection;
