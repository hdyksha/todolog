import { useState } from 'react';
import { Task, Priority } from './types';
import { useTasks } from './hooks/useTasks';
import './App.css';

function App() {
  // タスク管理のカスタムフックを使用
  const {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateMemo,
  } = useTasks();

  // UI状態
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 新規タスク追加ハンドラー
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle, Priority.Medium);
      setNewTaskTitle('');
    }
  };

  // タスク削除ハンドラー
  const handleDeleteTask = (id: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      deleteTask(id);
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
            <form className="task-form" onSubmit={handleAddTask}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="新しいタスクを入力..."
                required
              />
              <button type="submit">追加</button>
            </form>

            <div className="task-list">
              <h2>タスク一覧</h2>
              {tasks.length === 0 ? (
                <p className="no-tasks">タスクはありません</p>
              ) : (
                <ul>
                  {tasks.map((task) => (
                    <li key={task.id} className={task.completed ? 'completed' : ''}>
                      <div className="task-item">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                        />
                        <span className="task-title">{task.title}</span>
                        <div className="task-actions">
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>TodoLog &copy; 2025</p>
      </footer>
    </div>
  );
}

export default App;
