import { useState, useCallback, useMemo } from 'react';
import { Task } from '../types/Task';
import { apiService } from '../services/ApiService';

// 日付ごとにグループ化されたタスクの型
export interface TasksByDate {
  [date: string]: Task[];
}

/**
 * タスク操作のためのカスタムフック
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * タスクを日付ごとにグループ化し、アクティブとアーカイブに分ける
   */
  const groupedTasks = useMemo(() => {
    const active: TasksByDate = {};
    const archived: TasksByDate = {};

    // タスクを日付でソート（新しい順）
    const sortedTasks = [...tasks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sortedTasks.forEach(task => {
      // 日付部分のみを抽出（YYYY-MM-DD）
      const date = new Date(task.createdAt).toISOString().split('T')[0];

      // 完了済みタスクとそれ以外で分ける
      const targetGroup = task.completed ? archived : active;

      if (!targetGroup[date]) {
        targetGroup[date] = [];
      }

      targetGroup[date].push(task);
    });

    return { active, archived };
  }, [tasks]);

  /**
   * 特定のファイルからタスクを読み込む
   */
  const loadTasksFromFile = useCallback(async (filename: string) => {
    if (!filename) return false;

    try {
      setLoading(true);
      const loadedTasks = await apiService.getTasks(filename);
      setTasks(loadedTasks);
      setError(null);
      return true;
    } catch (err) {
      setError(`タスクの読み込みに失敗しました: ${filename}`);
      console.error(`タスクの読み込みエラー (${filename}):`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * タスクをファイルに保存
   */
  const saveTasksToFile = useCallback(
    async (filename: string) => {
      if (!filename || tasks.length === 0) return false;

      try {
        await apiService.saveTasks(filename, tasks);
        return true;
      } catch (err) {
        setError(`タスクの保存に失敗しました: ${filename}`);
        console.error(`タスクの保存エラー (${filename}):`, err);
        return false;
      }
    },
    [tasks]
  );

  /**
   * 新しいタスクを追加
   */
  const addTask = useCallback((text: string) => {
    if (text.trim() === '') return false;

    const newTaskItem: Task = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks(prevTasks => [...prevTasks, newTaskItem]);
    setNewTask('');
    return true;
  }, []);

  /**
   * タスクの完了状態を切り替え
   */
  const toggleTask = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  }, []);

  /**
   * タスクを削除
   */
  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  /**
   * タスクをリセット
   */
  const resetTasks = useCallback(() => {
    setTasks([]);
  }, []);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    activeTasks: groupedTasks.active,
    archivedTasks: groupedTasks.archived,
    newTask,
    loading,
    error,
    setNewTask,
    loadTasksFromFile,
    saveTasksToFile,
    addTask,
    toggleTask,
    deleteTask,
    resetTasks,
    clearError,
  };
}
