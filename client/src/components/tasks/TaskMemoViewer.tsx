import type React from 'react';
import TaskMemoViewer from '../TaskMemoViewer';
import './TaskMemoViewer.css';

interface TaskMemoViewerProps {
  memo: string;
  onCheckboxChange: (newMemo: string) => void;
  onEdit?: () => void;
}

/**
 * タスクメモの表示コンポーネント
 * 既存のTaskMemoViewerをラップして、追加のスタイルや機能を提供
 */
const TaskMemoViewerWrapper: React.FC<TaskMemoViewerProps> = ({
  memo,
  onCheckboxChange,
  onEdit,
}) => {
  return (
    <div 
      className="task-memo-viewer-wrapper"
      onClick={onEdit}
    >
      {memo ? (
        <TaskMemoViewer 
          memo={memo} 
          onCheckboxChange={onCheckboxChange}
        />
      ) : (
        <div className="task-memo-empty">
          メモはありません。クリックして編集を開始してください。
        </div>
      )}
    </div>
  );
};

export default TaskMemoViewerWrapper;
