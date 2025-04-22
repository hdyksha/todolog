import React, { useMemo } from 'react';
import { Task } from '../../types';
import { groupTasksByDate } from '../../utils/dateUtils';
import DateGroup from './DateGroup';
import './ArchivedTaskList.css';

interface ArchivedTaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onEditMemo?: (id: string) => void;
}

/**
 * アーカイブされたタスクを日付ごとにグループ化して表示するコンポーネント
 */
const ArchivedTaskList: React.FC<ArchivedTaskListProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onEditMemo,
}) => {
  // 完了済みタスクのみをフィルタリング
  const archivedTasks = useMemo(() => {
    return tasks.filter(task => task.completed);
  }, [tasks]);
  
  // 日付ごとにグルーピング
  const tasksByDate = useMemo(() => {
    return groupTasksByDate(archivedTasks);
  }, [archivedTasks]);
  
  // 日付の配列を取得（新しい順）
  const dateKeys = useMemo(() => {
    return Object.keys(tasksByDate).sort().reverse();
  }, [tasksByDate]);
  
  if (archivedTasks.length === 0) {
    return <p className="no-archived-tasks">アーカイブされたタスクはありません</p>;
  }
  
  return (
    <div className="archived-task-list">
      {dateKeys.map(dateKey => (
        <DateGroup
          key={dateKey}
          date={new Date(dateKey)}
          tasks={tasksByDate[dateKey]}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          onEditMemo={onEditMemo}
        />
      ))}
    </div>
  );
};

export default ArchivedTaskList;
