import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks, useToggleTaskCompletion, useDeleteTask, useCreateTask } from '../services/api/taskApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { useNotification } from '../store/NotificationContext';
import { Priority, Task } from '../types';

export function HomePage() {
  const { data: tasks, isLoading, isError, error } = useTasks();
  const toggleTaskMutation = useToggleTaskCompletion();
  const deleteTaskMutation = useDeleteTask();
  const createTaskMutation = useCreateTask();
  const { showNotification } = useNotification();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ローカルでの完了状態を管理するための状態
  const [localCompletedState, setLocalCompletedState] = useState<Record<string, boolean>>({});

  // タスクの完了状態を取得する関数
  const getTaskCompletedState = (task: Task): boolean => {
    // ローカル状態が存在する場合はそれを優先
    if (task.id in localCompletedState) {
      return localCompletedState[task.id];
    }
    // そうでなければタスクの状態を使用
    return task.completed;
  };

  const handleToggleCompletion = async (id: string) => {
    // 現在のタスクを取得
    const task = tasks?.find(t => t.id === id);
    if (!task) return;
    
    // 現在の状態を取得
    const currentState = getTaskCompletedState(task);
    
    // ローカル状態を即座に更新（UIの即時反映のため）
    setLocalCompletedState(prev => ({
      ...prev,
      [id]: !currentState
    }));
    
    try {
      await toggleTaskMutation.mutateAsync(id);
      // 成功したらローカル状態をクリア（サーバーの状態を信頼）
      setLocalCompletedState(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (err) {
      // エラー時はローカル状態を元に戻す
      setLocalCompletedState(prev => {
        const newState = { ...prev };
        delete newState[id]; // エラー時は元の状態に戻す
        return newState;
      });
      
      showNotification(
        err instanceof Error ? err.message : 'タスクの状態変更に失敗しました',
        'error'
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      try {
        await deleteTaskMutation.mutateAsync(id);
        showNotification('タスクを削除しました', 'success');
      } catch (err) {
        showNotification(
          err instanceof Error ? err.message : 'タスクの削除に失敗しました',
          'error'
        );
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) {
      showNotification('タスク名を入力してください', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createTaskMutation.mutateAsync({
        title: newTaskTitle.trim(),
        priority: Priority.Medium, // デフォルト優先度
      });
      
      setNewTaskTitle('');
      showNotification('新しいタスクを作成しました', 'success');
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'タスクの作成に失敗しました',
        'error'
      );
    } finally {
      setIsSubmitting(false);
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
          onClick={() => window.location.reload()}
        >
          再読み込み
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">タスク一覧</h2>
        
        {/* タスク追加フォーム */}
        <form onSubmit={handleCreateTask} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-grow">
              <Input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="新しいタスクを入力..."
                className="mb-0"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              追加
            </Button>
          </div>
        </form>
        
        {tasks && tasks.length === 0 ? (
          <div className="bg-slate-100 dark:bg-slate-800 p-8 text-center rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              タスクはありません。新しいタスクを追加してください。
            </p>
          </div>
        ) : (
          <div className="bg-slate-100 dark:bg-slate-800 shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {tasks?.map((task) => {
                const isCompleted = getTaskCompletedState(task);
                
                return (
                  <li key={task.id} className="p-4 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <div className="flex items-center">
                      <Checkbox
                        checked={isCompleted}
                        onChange={() => handleToggleCompletion(task.id)}
                      />
                      <Link 
                        to={`/tasks/${task.id}`}
                        className={`ml-3 flex-grow hover:underline ${
                          isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </Link>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label="タスクを削除"
                        >
                          <svg
                            className="h-5 w-5 text-slate-500 hover:text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
