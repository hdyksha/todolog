import React, { useState } from 'react';
import { Task } from '../../types/Task';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  isArchived?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isArchived = false,
  onToggle,
  onDelete,
  onUpdateTask,
}) => {
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(task.dueDate || '');

  // 時刻のフォーマット
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 期限日が過ぎているかチェック
  const isOverdue = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    return dueDate < today && !task.completed;
  };

  // 期限日が近いかチェック（3日以内）
  const isUpcoming = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3 && !task.completed;
  };

  // タスクのクラス名を決定
  const getTaskClassName = () => {
    let className = `task-item ${isArchived ? 'archived' : ''}`;
    if (isOverdue()) className += ' overdue';
    else if (isUpcoming()) className += ' upcoming';
    return className;
  };

  // 期限日の編集を開始
  const handleEditDueDate = () => {
    setIsEditingDueDate(true);
  };

  // 期限日の保存
  const handleSaveDueDate = () => {
    onUpdateTask(task.id, { dueDate: dueDate || undefined });
    setIsEditingDueDate(false);
  };

  // 期限日の削除
  const handleRemoveDueDate = () => {
    setDueDate('');
    onUpdateTask(task.id, { dueDate: undefined });
    setIsEditingDueDate(false);
  };

  // 期限日の表示/編集コンポーネント
  const renderDueDateComponent = () => {
    if (isEditingDueDate) {
      return (
        <div className="task-due-date-edit">
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          <button onClick={handleSaveDueDate} className="save-btn" title="期限日を保存">
            保存
          </button>
          <button onClick={handleRemoveDueDate} className="remove-btn" title="期限日を削除">
            削除
          </button>
          <button
            onClick={() => setIsEditingDueDate(false)}
            className="cancel-btn"
            title="キャンセル"
          >
            キャンセル
          </button>
        </div>
      );
    }

    if (task.dueDate) {
      return (
        <span
          className={`task-due-date ${isOverdue() ? 'overdue' : ''} ${isUpcoming() ? 'upcoming' : ''}`}
          onClick={handleEditDueDate}
          title="クリックして期限日を編集"
        >
          期限: {formatDate(task.dueDate)}
        </span>
      );
    }

    return (
      <button onClick={handleEditDueDate} className="add-due-date-btn" title="期限日を設定">
        期限を設定
      </button>
    );
  };

  return (
    <div className={getTaskClassName()}>
      <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
      <span className="task-text">{task.text}</span>
      <span className="task-time">{formatTime(task.createdAt)}</span>
      {renderDueDateComponent()}
      <button onClick={() => onDelete(task.id)} className="delete-btn" title="タスクを削除">
        削除
      </button>
    </div>
  );
};

export default React.memo(TaskItem);
