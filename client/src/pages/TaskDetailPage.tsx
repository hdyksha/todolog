import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../contexts/TaskContext';
import { useTaskActions } from '../hooks/useTaskActions';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import TaskHeader from '../components/tasks/TaskHeader';
import TaskMetadata from '../components/tasks/TaskMetadata';
import TaskMemoEditor from '../components/tasks/TaskMemoEditor';
import TaskMemoViewer from '../components/tasks/TaskMemoViewer';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import Button from '../components/ui/Button';
import api from '../services/api';
import { Task } from '../types';
import './TaskDetailPage.css';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading, error } = useTaskContext();
  const { fetchTasks, updateMemo, toggleTaskCompletion, deleteTask } = useTaskActions();
  
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memo, setMemo] = useState('');
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<Error | null>(null);

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

  // タスク詳細を個別に取得
  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (!id) return;
      
      setLoadingDetail(true);
      setDetailError(null);
      
      try {
        const detailData = await api.fetchTaskById(id);
        setTaskDetail(detailData);
        setMemo(detailData.memo || '');
      } catch (error) {
        console.error('タスク詳細の取得エラー:', error);
        setDetailError(error instanceof Error ? error : new Error('タスク詳細の取得に失敗しました'));
      } finally {
        setLoadingDetail(false);
      }
    };
    
    fetchTaskDetail();
  }, [id]);

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
        action: () => {/* マークダウンヘルプは各コンポーネントで処理 */},
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

  // メモの保存
  const handleSaveMemo = async (updatedMemo: string) => {
    if (!id) return;
    
    try {
      await updateMemo(id, updatedMemo);
      setIsEditingMemo(false);
      
      // メモ更新後に詳細を再取得
      const updatedTask = await api.fetchTaskById(id);
      setTaskDetail(updatedTask);
      // 更新されたメモを状態に反映
      setMemo(updatedTask.memo || '');
    } catch (error) {
      console.error('メモ更新エラー:', error);
      throw error;
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
      
      // 状態変更後に詳細を再取得
      const updatedTask = await api.fetchTaskById(id);
      setTaskDetail(updatedTask);
    } catch (error) {
      console.error('タスク状態変更エラー:', error);
    }
  };

  // ローディング中の表示
  if (loading || loadingDetail) {
    return <LoadingIndicator message="タスクを読み込み中..." />;
  }

  // エラー時の表示
  if (error || detailError) {
    return (
      <ErrorDisplay
        message={(error || detailError)?.message || 'エラーが発生しました'}
        onRetry={() => fetchTasks(true)}
      />
    );
  }

  // タスクが見つからない場合
  if (!task && !taskDetail) {
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

  // タスク詳細を優先して使用し、なければタスク一覧のデータを使用
  const displayTask = taskDetail || task;

  return (
    <div className="task-detail-page">
      <TaskHeader
        title={displayTask.title}
        isCompleted={displayTask.completed}
        onToggleCompletion={handleToggleCompletion}
        onDelete={handleDeleteTask}
      />

      <TaskMetadata
        isCompleted={displayTask.completed}
        priority={displayTask.priority}
        tags={displayTask.tags}
        dueDate={displayTask.dueDate}
        createdAt={displayTask.createdAt}
        updatedAt={displayTask.updatedAt}
      />

      <div className="task-detail-memo">
        <div className="task-detail-memo-header">
          <h2>メモ</h2>
          {!isEditingMemo && (
            <div className="task-detail-memo-actions">
              <Button
                variant="secondary"
                size="small"
                onClick={() => setIsEditingMemo(true)}
                type="button"
              >
                編集
              </Button>
            </div>
          )}
        </div>

        {isEditingMemo ? (
          <TaskMemoEditor
            initialMemo={memo}
            onSave={handleSaveMemo}
            onCancel={() => {
              setIsEditingMemo(false);
              // キャンセル時に現在のタスク詳細のメモに戻す
              setMemo(taskDetail?.memo || '');
            }}
            onCheckboxChange={handleCheckboxChange}
          />
        ) : (
          <TaskMemoViewer
            memo={displayTask?.memo || ''}
            onCheckboxChange={handleCheckboxChange}
            onEdit={() => setIsEditingMemo(true)}
          />
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
