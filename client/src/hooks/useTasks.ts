import { useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import * as api from '../services/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // タスク一覧を取得
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await api.fetchTasks();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('タスクの取得に失敗しました'));
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // タスクを追加
  const addTask = async (
    title: string,
    priority: Priority = Priority.Medium,
    category?: string,
    dueDate?: string,
    memo?: string
  ) => {
    try {
      const newTask = await api.createTask({
        title,
        priority,
        category,
        dueDate,
        memo,
      });
      setTasks((prevTasks) => [...prevTasks, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('タスクの追加に失敗しました'));
    }
  };

  // タスクを更新
  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    try {
      const updatedTask = await api.updateTask(id, updates);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('タスクの更新に失敗しました'));
    }
  };

  // タスクを削除
  const deleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('タスクの削除に失敗しました'));
    }
  };

  // タスクの完了状態を切り替え
  const toggleTaskCompletion = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        const updatedTask = await api.toggleTaskCompletion(id);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === id ? updatedTask : t))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('タスクの状態変更に失敗しました'));
    }
  };

  // タスクのメモを更新
  const updateMemo = async (id: string, memo: string) => {
    try {
      const updatedTask = await api.updateTaskMemo(id, memo);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('メモの更新に失敗しました'));
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateMemo,
  };
}
