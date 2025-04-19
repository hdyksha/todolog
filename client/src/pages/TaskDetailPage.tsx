import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../contexts/TaskContext';
import { useTaskActions } from '../hooks/useTaskActions';
import Button from '../components/ui/Button';
import CategoryBadge from '../components/categories/CategoryBadge';
import { Priority } from '../types';
import './TaskDetailPage.css';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading, error } = useTaskContext();
  const { fetchTasks, updateMemo, toggleTaskCompletion, deleteTask } = useTaskActions();
  
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // タスクの取得
  const task = tasks.find((t) => t.id === id);

  // 初回ロード時にタスク一覧を取得（キャッシュがない場合）
  useEffect(() => {
    if (tasks.length === 0 && !loading && !error) {
      fetchTasks();
    }
  }, [tasks.length, loading, error, fetchTasks]);

  // タスクが見つかったらメモを初期化
  useEffect(() => {
    if (task) {
      setMemo(task.memo || '');
    }
  }, [task]);

  // メモの保存
  const handleSaveMemo = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updateMemo(id, memo);
      setIsEditingMemo(false);
    } catch (error) {
      console.error('メモ更新エラー:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // タスクの削除
  const handleDeleteTask = async () => {
    if (!id) return;
    
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      try {
        await deleteTask(id);
        navigate('/');
      } catch (error) {
        console.error('タスク削除エラー:', error);
      }
    }
  };

  // 完了状態の切り替え
  const handleToggleCompletion = async () => {
    if (!id) return;
    
    try {
      await toggleTaskCompletion(id);
    } catch (error) {
      console.error('タスク状態変更エラー:', error);
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
  if (error) {
    return (
      <div className="error-container">
        <h2>エラーが発生しました</h2>
        <p>{error.message}</p>
        <Button onClick={() => fetchTasks(true)}>再読み込み</Button>
      </div>
    );
  }

  // タスクが見つからない場合
  if (!task) {
    return (
      <div className="task-detail-page">
        <div className="error-container">
          <h2>タスクが見つかりません</h2>
          <p>指定されたIDのタスクは存在しないか、削除された可能性があります。</p>
          <Button onClick={() => navigate('/')}>タスク一覧に戻る</Button>
        </div>
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
            onClick={handleToggleCompletion}
          >
            {task.completed ? '未完了にする' : '完了にする'}
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteTask}
          >
            削除
          </Button>
          <Button
            variant="text"
            onClick={() => navigate('/')}
          >
            一覧に戻る
          </Button>
        </div>
      </div>

      <div className="task-detail-info">
        <div className="task-detail-status">
          <span className="task-detail-label">ステータス</span>
          <span className={`task-status ${task.completed ? 'completed' : 'active'}`}>
            {task.completed ? '完了' : '未完了'}
          </span>
        </div>

        <div className="task-detail-priority">
          <span className="task-detail-label">優先度</span>
          <span className={`task-priority priority-${task.priority}`}>
            {task.priority === Priority.High
              ? '高'
              : task.priority === Priority.Medium
              ? '中'
              : '低'}
          </span>
        </div>

        {task.category && (
          <div className="task-detail-category">
            <span className="task-detail-label">カテゴリ</span>
            <CategoryBadge category={task.category} />
          </div>
        )}

        {task.dueDate && (
          <div className="task-detail-due-date">
            <span className="task-detail-label">期限</span>
            <span className="task-date">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="task-detail-dates">
          <div>
            <span className="task-detail-label">作成日</span>
            <span className="task-date">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="task-detail-label">更新日</span>
            <span className="task-date">
              {new Date(task.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="task-detail-memo">
        <div className="task-detail-memo-header">
          <h2>メモ</h2>
          <div className="task-detail-memo-actions">
            {isEditingMemo ? (
              <>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSaveMemo}
                  isLoading={isSaving}
                >
                  保存
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setIsEditingMemo(false);
                    setMemo(task.memo || '');
                  }}
                  disabled={isSaving}
                >
                  キャンセル
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setIsEditingMemo(true)}
              >
                編集
              </Button>
            )}
          </div>
        </div>

        {isEditingMemo ? (
          <textarea
            className="task-detail-memo-editor"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力..."
            disabled={isSaving}
            autoFocus
          />
        ) : (
          <div className="task-detail-memo-content">
            {task.memo ? (
              task.memo
            ) : (
              <span className="task-detail-memo-empty">メモはありません</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
