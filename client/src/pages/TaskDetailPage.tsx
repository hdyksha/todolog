import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useTaskActions } from '../hooks/useTaskActions';
import { Task } from '../types';
import Button from '../components/ui/Button';
import './TaskDetailPage.css';

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { updateTask, deleteTask, updateMemo } = useTaskActions();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [memo, setMemo] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // タスクの取得
  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      
      try {
        setLoading(true);
        const fetchedTask = await apiClient.fetchTaskById(taskId);
        setTask(fetchedTask);
        setMemo(fetchedTask.memo || '');
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('タスクの取得に失敗しました'));
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // タスク削除ハンドラー
  const handleDeleteTask = async () => {
    if (!task) return;
    
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      try {
        await deleteTask(task.id);
        navigate('/');
      } catch (err) {
        // エラーハンドリングはuseTaskActionsで行われる
      }
    }
  };

  // メモ更新ハンドラー
  const handleUpdateMemo = async () => {
    if (!task) return;
    
    try {
      await updateMemo(task.id, memo);
      setIsEditing(false);
    } catch (err) {
      // エラーハンドリングはuseTaskActionsで行われる
    }
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  // エラー時の表示
  if (error || !task) {
    return (
      <div className="error-container">
        <h2>エラーが発生しました</h2>
        <p>{error?.message || 'タスクが見つかりません'}</p>
        <Button onClick={() => navigate('/')}>ホームに戻る</Button>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      <div className="task-detail-header">
        <h1>{task.title}</h1>
        <div className="task-detail-actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
          >
            戻る
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteTask}
          >
            削除
          </Button>
        </div>
      </div>

      <div className="task-detail-info">
        <div className="task-detail-status">
          <span className="task-detail-label">状態:</span>
          <span className={`task-status ${task.completed ? 'completed' : 'active'}`}>
            {task.completed ? '完了' : '未完了'}
          </span>
        </div>

        <div className="task-detail-priority">
          <span className="task-detail-label">優先度:</span>
          <span className={`task-priority priority-${task.priority}`}>
            {task.priority === 'high'
              ? '高'
              : task.priority === 'medium'
              ? '中'
              : '低'}
          </span>
        </div>

        {task.category && (
          <div className="task-detail-category">
            <span className="task-detail-label">カテゴリ:</span>
            <span className="task-category">{task.category}</span>
          </div>
        )}

        {task.dueDate && (
          <div className="task-detail-due-date">
            <span className="task-detail-label">期限:</span>
            <span className="task-due-date">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="task-detail-dates">
          <div>
            <span className="task-detail-label">作成日:</span>
            <span className="task-date">
              {new Date(task.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="task-detail-label">更新日:</span>
            <span className="task-date">
              {new Date(task.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="task-detail-memo">
        <div className="task-detail-memo-header">
          <h2>メモ</h2>
          {!isEditing ? (
            <Button
              variant="text"
              size="small"
              onClick={() => setIsEditing(true)}
            >
              編集
            </Button>
          ) : (
            <div className="task-detail-memo-actions">
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setMemo(task.memo || '');
                  setIsEditing(false);
                }}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleUpdateMemo}
              >
                保存
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <textarea
            className="task-detail-memo-editor"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力..."
            rows={5}
          />
        ) : (
          <div className="task-detail-memo-content">
            {task.memo ? (
              <p>{task.memo}</p>
            ) : (
              <p className="task-detail-memo-empty">メモはありません</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
