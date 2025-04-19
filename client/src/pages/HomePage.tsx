import { useState } from 'react';
import { useTasks, useToggleTaskCompletion, useDeleteTask } from '../services/api/taskApi';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useNotification } from '../store/NotificationContext';

export function HomePage() {
  const { data: tasks, isLoading, isError, error } = useTasks();
  const toggleTaskMutation = useToggleTaskCompletion();
  const deleteTaskMutation = useDeleteTask();
  const { showNotification } = useNotification();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleToggleCompletion = async (id: string) => {
    try {
      await toggleTaskMutation.mutateAsync(id);
    } catch (err) {
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
        
        {/* タスク追加フォームは後で実装 */}
        
        {tasks && tasks.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 text-center rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              タスクはありません。新しいタスクを追加してください。
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks?.map((task) => (
                <li key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleCompletion(task.id)}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span
                      className={`ml-3 flex-grow ${
                        task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label="タスクを削除"
                      >
                        <svg
                          className="h-5 w-5 text-gray-500 hover:text-red-500"
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
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
