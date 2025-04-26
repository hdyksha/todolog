import type React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import './TaskHeader.css';

interface TaskHeaderProps {
  title: string;
  isCompleted: boolean;
  onToggleCompletion: () => void;
  onDelete: () => void;
}

/**
 * タスク詳細ページのヘッダーコンポーネント
 * タイトルと主要なアクションボタンを表示します
 */
const TaskHeader: React.FC<TaskHeaderProps> = ({
  title,
  isCompleted,
  onToggleCompletion,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <div className="task-detail-header">
      <h1>{title}</h1>
      <div className="task-detail-actions">
        <Button
          variant="secondary"
          onClick={onToggleCompletion}
          type="button"
        >
          {isCompleted ? '未完了にする' : '完了にする'}
        </Button>
        <Button
          variant="danger"
          onClick={onDelete}
          type="button"
        >
          削除
        </Button>
        <Button
          variant="text"
          onClick={() => navigate('/')}
          type="button"
        >
          一覧に戻る
        </Button>
      </div>
    </div>
  );
};

export default TaskHeader;
