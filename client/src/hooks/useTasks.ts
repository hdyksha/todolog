import { useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import * as api from '../services/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // タスク一覧を取得
  const fetchTasksData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await api.fetchTasks(forceRefresh);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('タスクの取得に失敗しました'));
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード時にタスク一覧を取得
  useEffect(() => {
    fetchTasksData();
  }, []);

  // 通知を表示して自動的に消す
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000); // 3秒後に通知を消す
  };

  // タスクを追加
  const addTask = async (
    title: string,
    priority: Priority = Priority.Medium,
    category?: string,
    dueDate?: string,
    memo?: string
  ) => {
    try {
      // 楽観的にUIを更新
      const tempId = `temp-${Date.now()}`;
      const tempTask: Task = {
        id: tempId,
        title,
        completed: false,
        priority,
        category,
        dueDate,
        memo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTasks(prevTasks => [...prevTasks, tempTask]);
      
      // APIを呼び出して実際に追加
      const newTask = await api.createTask({
        title,
        priority,
        category,
        dueDate,
        memo,
      });
      
      // 一時的なタスクを実際のタスクで置き換え
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === tempId ? newTask : task)
      );
    } catch (err) {
      // エラーが発生した場合は一時的なタスクを削除
      setError(err instanceof Error ? err : new Error('タスクの追加に失敗しました'));
      showNotification('タスクの追加に失敗しました', 'error');
      
      // 一時的なタスクを削除
      setTasks(prevTasks => prevTasks.filter(task => !task.id.startsWith('temp-')));
    }
  };

  // タスクを更新
  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    try {
      // 現在のタスクを保存
      const originalTask = tasks.find(t => t.id === id);
      if (!originalTask) return;
      
      // 楽観的にUIを更新
      setTasks(prevTasks =>
        prevTasks.map(task => task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task)
      );
      
      // APIを呼び出して実際に更新
      const updatedTask = await api.updateTask(id, updates);
      
      // サーバーからの応答でUIを更新（差異がある場合）
      setTasks(prevTasks =>
        prevTasks.map(task => task.id === id ? updatedTask : task)
      );
    } catch (err) {
      // エラーが発生した場合は元の状態に戻す
      setError(err instanceof Error ? err : new Error('タスクの更新に失敗しました'));
      showNotification('タスクの更新に失敗しました', 'error');
      
      // 元の状態に戻すために再取得
      await fetchTasksData(true);
    }
  };

  // タスクを削除
  const deleteTask = async (id: string) => {
    try {
      // 削除するタスクを保存
      const taskToDelete = tasks.find(t => t.id === id);
      if (!taskToDelete) return;
      
      // 楽観的にUIを更新
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      
      // APIを呼び出して実際に削除
      await api.deleteTask(id);
    } catch (err) {
      // エラーが発生した場合は元の状態に戻す
      setError(err instanceof Error ? err : new Error('タスクの削除に失敗しました'));
      showNotification('タスクの削除に失敗しました', 'error');
      
      // 元の状態に戻すために再取得
      await fetchTasksData(true);
    }
  };

  // タスクの完了状態を切り替え
  const toggleTaskCompletion = async (id: string) => {
    try {
      // 現在のタスクを取得
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      // 楽観的にUIを更新
      setTasks(prevTasks =>
        prevTasks.map(t => 
          t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
        )
      );
      
      // APIを呼び出して実際に更新
      const updatedTask = await api.toggleTaskCompletion(id);
      
      // サーバーからの応答と予測が異なる場合は静かに修正
      if (updatedTask.completed !== !task.completed) {
        setTasks(prevTasks =>
          prevTasks.map(t => (t.id === id ? updatedTask : t))
        );
      }
    } catch (err) {
      // エラーが発生した場合は元の状態に戻す
      const task = tasks.find(t => t.id === id);
      if (task) {
        setTasks(prevTasks =>
          prevTasks.map(t => 
            t.id === id ? { ...t, completed: task.completed } : t
          )
        );
      }
      
      setError(err instanceof Error ? err : new Error('タスクの状態変更に失敗しました'));
      showNotification('タスクの状態変更に失敗しました', 'error');
    }
  };

  // タスクのメモを更新
  const updateMemo = async (id: string, memo: string) => {
    try {
      // 現在のタスクを保存
      const originalTask = tasks.find(t => t.id === id);
      if (!originalTask) return;
      
      // 楽観的にUIを更新
      setTasks(prevTasks =>
        prevTasks.map(task => 
          task.id === id ? { ...task, memo, updatedAt: new Date().toISOString() } : task
        )
      );
      
      // APIを呼び出して実際に更新
      const updatedTask = await api.updateTaskMemo(id, memo);
      
      // サーバーからの応答でUIを更新（差異がある場合）
      if (updatedTask.memo !== memo) {
        setTasks(prevTasks =>
          prevTasks.map(task => (task.id === id ? updatedTask : task))
        );
      }
    } catch (err) {
      // エラーが発生した場合は元の状態に戻す
      const originalTask = tasks.find(t => t.id === id);
      if (originalTask) {
        setTasks(prevTasks =>
          prevTasks.map(task => 
            task.id === id ? { ...task, memo: originalTask.memo } : task
          )
        );
      }
      
      setError(err instanceof Error ? err : new Error('メモの更新に失敗しました'));
      showNotification('メモの更新に失敗しました', 'error');
    }
  };

  // タスク一覧を再取得
  const refreshTasks = () => {
    return fetchTasksData(true);
  };

  return {
    tasks,
    loading,
    error,
    notification,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateMemo,
    refreshTasks,
  };
}
