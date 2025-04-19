import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks, useToggleTaskCompletion, useDeleteTask, useCreateTask } from '../services/api/taskApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { useNotification } from '../store/NotificationContext';
import { Priority, Task } from '../types';

/**
 * カスタムトグルコンポーネント
 * チェックボックスの代わりに使用するカスタムUIコンポーネント
 */
function TaskToggle({ 
  completed, 
  onChange 
}: { 
  completed: boolean; 
  onChange: () => void 
}) {
  return (
    <button
      onClick={onChange}
      className={`w-5 h-5 flex items-center justify-center rounded border ${
        completed 
          ? 'bg-blue-600 border-blue-600 text-white' 
          : 'bg-white border-slate-300'
      }`}
      aria-checked={completed}
      role="checkbox"
    >
      {completed && (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * タスク項目コンポーネント
 * 個々のタスク項目を表示するコンポーネント
 */
function TaskItem({ 
  task, 
  onToggle, 
  onDelete 
}: { 
  task: Task; 
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  // ローカルでの完了状態を管理
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggle = async () => {
    // 即座にUIを更新
    setIsCompleted(!isCompleted);
    setIsToggling(true);
    
    try {
      // APIを呼び出し
      await onToggle(task.id);
    } catch (err) {
      // エラー時は元の状態に戻す
      setIsCompleted(task.completed);
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <li className="p-4 hover:bg-slate-200 dark:hover:bg-slate-700">
      <div className="flex items-center">
        <div className={isToggling ? 'opacity-50' : ''}>
          <TaskToggle
            completed={isCompleted}
            onChange={handleToggle}
          />
        </div>
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
            onClick={() => onDelete(task.id)}
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
}

/**
 * ホームページコンポーネント（カスタムトグル実装版）
 */
export function HomePage() {
  const { data: tasks, isLoading, isError, error } = useTasks();
  const toggleTaskMutation = useToggleTaskCompletion();
  const deleteTaskMutation = useDeleteTask();
  const createTaskMutation = useCreateTask();
  const { showNotification } = useNotification();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleCompletion = async (id: string) => {
    try {
      await toggleTaskMutation.mutateAsync(id);
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'タスクの状態変更に失敗しました',
        'error'
      );
      throw err; // TaskItemコンポーネントでエラーハンドリングするために再スロー
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
              {tasks?.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleCompletion}
                  onDelete={handleDeleteTask}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
