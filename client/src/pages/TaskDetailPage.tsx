import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../contexts/TaskContext';
import { useTaskActions } from '../hooks/useTaskActions';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import Button from '../components/ui/Button';
import TagBadge from '../components/tags/TagBadge';
import TaskMemoViewer from '../components/TaskMemoViewer';
import MarkdownHelpModal from '../components/MarkdownHelpModal';
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // キーボードショートカットの設定
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  
  // タスクの取得
  const task = tasks.find((t) => t.id === id);

  // 初回ロード時にタスク一覧を取得（キャッシュがない場合）
  useEffect(() => {
    if (tasks.length === 0 && !loading && !error) {
      fetchTasks();
    }
  }, [tasks.length, loading, error, fetchTasks]);

  // キーボードショートカットの登録
  useEffect(() => {
    // 編集モードでない場合のショートカット
    if (!isEditingMemo) {
      registerShortcut({
        key: 'e',
        action: () => setIsEditingMemo(true),
        description: 'メモを編集',
        scope: 'タスク詳細'
      });
      
      registerShortcut({
        key: 'Backspace',
        action: () => navigate('/'),
        description: '一覧に戻る',
        scope: 'タスク詳細'
      });
      
      registerShortcut({
        key: 'h',
        action: () => setShowMarkdownHelp(true),
        description: 'マークダウンヘルプを表示',
        scope: 'タスク詳細'
      });
    }
    
    // クリーンアップ関数
    return () => {
      unregisterShortcut('e');
      unregisterShortcut('Backspace');
      unregisterShortcut('h');
    };
  }, [registerShortcut, unregisterShortcut, isEditingMemo, navigate]);

  // タスクが見つかったらメモを初期化
  useEffect(() => {
    if (task) {
      setMemo(task.memo || '');
    }
  }, [task]);

  // 編集モードになったらテキストエリアにフォーカス
  useEffect(() => {
    if (isEditingMemo && !isPreviewMode && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditingMemo, isPreviewMode]);

  // メモの保存
  const handleSaveMemo = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updateMemo(id, memo);
      setIsEditingMemo(false);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('メモ更新エラー:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // チェックボックスの状態変更時の処理
  const handleCheckboxChange = (newMemo: string) => {
    if (!id) return;
    setMemo(newMemo);
    updateMemo(id, newMemo).catch(error => {
      console.error('チェックボックス更新エラー:', error);
    });
  };
  
  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter または Cmd+Enter で保存
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveMemo();
    }
    // Escキーでキャンセル
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingMemo(false);
      setIsPreviewMode(false);
      setMemo(task?.memo || '');
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

        {task.tags && task.tags.length > 0 && (
          <div className="task-detail-tags">
            <span className="task-detail-label">タグ</span>
            <div className="task-tags-container">
              {task.tags.map(tag => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
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
                  variant={isPreviewMode ? "secondary" : "text"}
                  size="small"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  {isPreviewMode ? "編集" : "プレビュー"}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowMarkdownHelp(true)}
                  title="マークダウンヘルプ"
                >
                  <span role="img" aria-label="ヘルプ">❓</span>
                </Button>
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
                    setIsPreviewMode(false);
                    setMemo(task?.memo || '');
                  }}
                  disabled={isSaving}
                >
                  キャンセル
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setIsEditingMemo(true)}
                >
                  編集
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowMarkdownHelp(true)}
                  title="マークダウンヘルプ"
                >
                  <span role="img" aria-label="ヘルプ">❓</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="task-detail-memo-content">
          {isEditingMemo ? (
            isPreviewMode ? (
              <div className="task-memo-preview">
                <TaskMemoViewer 
                  memo={memo} 
                  onCheckboxChange={handleCheckboxChange}
                />
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                className="task-detail-memo-editor"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモを入力..."
                disabled={isSaving}
                onKeyDown={handleKeyDown}
              />
            )
          ) : (
            <div 
              className="task-memo-viewer-container"
              onClick={() => setIsEditingMemo(true)}
            >
              <TaskMemoViewer 
                memo={task?.memo || ''} 
                onCheckboxChange={handleCheckboxChange}
              />
            </div>
          )}
        </div>
      </div>

      {showMarkdownHelp && (
        <MarkdownHelpModal onClose={() => setShowMarkdownHelp(false)} />
      )}
    </div>
  );
};

export default TaskDetailPage;
