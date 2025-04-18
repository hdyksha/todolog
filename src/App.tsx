import { useState } from 'react';
import { Task, TaskFilter, TaskSort } from './types';
import { useTasks } from './hooks/useTasks';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import MemoEditor from './components/MemoEditor';
import './App.css';

function App() {
  // タスク管理のカスタムフックを使用
  const {
    tasks,
    loading,
    error,
    filter,
    sort,
    categories,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateMemo,
    setFilter,
    setSort,
  } = useTasks();

  // UI状態
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [memoTask, setMemoTask] = useState<Task | null>(null);

  // タスク保存ハンドラー
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (taskData.id) {
      // 既存タスクの更新
      updateTask(taskData.id, taskData);
      setEditingTask(null);
    } else {
      // 新規タスクの追加
      addTask(
        taskData.title,
        taskData.priority,
        taskData.category,
        taskData.dueDate,
        taskData.memo
      );
      setIsAddingTask(false);
    }
  };

  // メモ保存ハンドラー
  const handleSaveMemo = (taskId: string, memo: string) => {
    updateMemo(taskId, memo);
    setMemoTask(null);
  };

  // タスク編集ハンドラー
  const handleEditTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setEditingTask(task);
    }
  };

  // メモ編集ハンドラー
  const handleEditMemo = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setMemoTask(task);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TodoLog</h1>
        <p>タスク管理アプリケーション</p>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : error ? (
          <div className="error">
            <p>エラーが発生しました: {error.message}</p>
            <button onClick={() => window.location.reload()}>再読み込み</button>
          </div>
        ) : (
          <>
            <div className="app-actions">
              <button
                className="add-task-button"
                onClick={() => setIsAddingTask(true)}
              >
                + 新しいタスク
              </button>
            </div>

            <TaskList
              tasks={tasks}
              filter={filter}
              sort={sort}
              categories={categories}
              onToggleComplete={toggleTaskCompletion}
              onDeleteTask={deleteTask}
              onEditTask={handleEditTask}
              onEditMemo={handleEditMemo}
              onFilterChange={setFilter}
              onSortChange={setSort}
            />
          </>
        )}
      </main>

      {/* タスク追加/編集フォーム */}
      {(isAddingTask || editingTask) && (
        <TaskForm
          task={editingTask || undefined}
          categories={categories}
          onSave={handleSaveTask}
          onCancel={() => {
            setIsAddingTask(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* メモ編集 */}
      {memoTask && (
        <MemoEditor
          taskId={memoTask.id}
          initialMemo={memoTask.memo || ''}
          onSave={handleSaveMemo}
          onClose={() => setMemoTask(null)}
        />
      )}
    </div>
  );
}

export default App;
