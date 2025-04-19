import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTask, useUpdateTaskMemo, useDeleteTask } from '../services/api/taskApi';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { useNotification } from '../store/NotificationContext';
import { formatDate } from '../utils/dateUtils';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memo, setMemo] = useState('');
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  
  const { data: task, isLoading, isError, error } = useTask(id || '');
  const updateMemoMutation = useUpdateTaskMemo();
  const deleteTaskMutation = useDeleteTask();
  
  // タスクデータが読み込まれたらメモを初期化
  if (task && !isEditingMemo && memo !== task.memo) {
    setMemo(task.memo || '');
  }
  
  const handleMemoSave = async () => {
    if (!id) return;
    
    try {
      await updateMemoMutation.mutateAsync({ id, memo });
      setIsEditingMemo(false);
      showNotification('メモを保存しました', 'success');
    } catch (err) {
      showNotification('メモの保存に失敗しました', 'error');
    }
  };
  
  const handleDeleteTask = async () => {
    if (!id) return;
    
    try {
      await deleteTaskMutation.mutateAsync(id);
      showNotification('タスクを削除しました', 'success');
      navigate('/');
    } catch (err) {
      showNotification('タスクの削除に失敗しました', 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <h2 className="text-red-800 dark:text-red-400 font-medium">エラーが発生しました</h2>
        <p className="text-red-700 dark:text-red-300 mt-2">
          {error instanceof Error ? error.message : 'タスクの取得に失敗しました'}
        </p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/')}
        >
          タスク一覧に戻る
        </Button>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h2 className="text-yellow-800 dark:text-yellow-400 font-medium">タスクが見つかりません</h2>
        <p className="text-yellow-700 dark:text-yellow-300 mt-2">
          指定されたIDのタスクは存在しないか、削除された可能性があります。
        </p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/')}
        >
          タスク一覧に戻る
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">タスク詳細</h1>
        <div className="flex space-x-2">
          <Link to={`/tasks/${id}/edit`}>
            <Button variant="secondary">
              編集
            </Button>
          </Link>
          <Button 
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            削除
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                task.completed 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {task.completed ? '完了' : '未完了'}
              </span>
              
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                task.priority === 'high' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
              </span>
              
              {task.category && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                  {task.category}
                </span>
              )}
              
              {task.dueDate && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  期限: {formatDate(task.dueDate)}
                </span>
              )}
            </div>
            
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <p>作成日: {formatDate(task.createdAt)}</p>
              <p>更新日: {formatDate(task.updatedAt)}</p>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">メモ</h3>
              {!isEditingMemo ? (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsEditingMemo(true)}
                >
                  編集
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleMemoSave}
                    isLoading={updateMemoMutation.isPending}
                  >
                    保存
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setMemo(task.memo || '');
                      setIsEditingMemo(false);
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              )}
            </div>
            
            {isEditingMemo ? (
              <textarea
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                rows={5}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモを入力してください"
              />
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md min-h-[100px] whitespace-pre-wrap">
                {task.memo ? task.memo : <span className="text-slate-400 dark:text-slate-500">メモはありません</span>}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="タスクの削除"
        footer={
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              キャンセル
            </Button>
            <Button 
              variant="danger"
              onClick={handleDeleteTask}
              isLoading={deleteTaskMutation.isPending}
            >
              削除
            </Button>
          </div>
        }
      >
        <p>タスク「{task.title}」を削除してもよろしいですか？</p>
        <p className="text-red-600 dark:text-red-400 mt-2">この操作は元に戻せません。</p>
      </Modal>
    </div>
  );
}
