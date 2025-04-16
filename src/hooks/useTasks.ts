import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types/Task';
import { apiService } from '../services/ApiService';
import { TaskOperationResult } from '../types/TaskOperationResult';
import { TaskFile } from '../types/TaskFile';

// タスク操作の結果型をエクスポート
export type { TaskOperationResult };

// 初期タスクリスト
const initialTasks: Task[] = [];

/**
 * タスク管理フック
 */
export const useTasks = () => {
  // タスクリストの状態
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  // 現在選択されているファイル
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  // 利用可能なファイルリスト
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  // 新しいタスクの入力値
  const [newTask, setNewTask] = useState<string>('');
  // ローディング状態
  const [loading, setLoading] = useState<boolean>(false);
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // 利用可能なファイルを取得する
  const fetchAvailableFiles = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      const files = await apiService.getTaskFiles();
      const fileNames = files.map(file => file.name);
      setAvailableFiles(fileNames);
      return fileNames;
    } catch (error) {
      console.error('ファイル一覧の取得に失敗しました:', error);
      setError('ファイル一覧の取得に失敗しました');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // タスクをファイルから読み込む
  const loadTasksFromFile = useCallback(
    async (filename: string): Promise<TaskOperationResult<boolean>> => {
      try {
        if (!filename) {
          return { success: false, error: 'ファイル名が指定されていません' };
        }

        setLoading(true);
        const loadedTasks = await apiService.getTasks(filename);
        setTasks(loadedTasks);
        setCurrentFile(filename);
        setError(null);
        return { success: true, data: true };
      } catch (error) {
        console.error(`${filename} からのタスク読み込みに失敗しました:`, error);
        setError(`${filename} からのタスク読み込みに失敗しました`);
        return { success: false, error: `${filename} からのタスク読み込みに失敗しました` };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // タスクを追加する
  const addTask = useCallback((text: string): TaskOperationResult<Task> => {
    try {
      if (!text.trim()) {
        return { success: false, error: 'タスク名を入力してください' };
      }

      const newTask: Task = {
        id: uuidv4(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTasks(prevTasks => [...prevTasks, newTask]);
      return { success: true, data: newTask };
    } catch (error) {
      console.error('タスクの追加に失敗しました:', error);
      return { success: false, error: 'タスクの追加に失敗しました' };
    }
  }, []);

  // タスクの完了状態を切り替える
  const toggleTask = useCallback((id: string): TaskOperationResult<Task> => {
    try {
      let updatedTask: Task | undefined;

      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => {
          if (task.id === id) {
            updatedTask = {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            };
            return updatedTask;
          }
          return task;
        });
        return updatedTasks;
      });

      if (!updatedTask) {
        return { success: false, error: `ID ${id} のタスクが見つかりません` };
      }

      return { success: true, data: updatedTask };
    } catch (error) {
      console.error('タスクの切り替えに失敗しました:', error);
      return { success: false, error: 'タスクの切り替えに失敗しました' };
    }
  }, []);

  // タスクを削除する
  const deleteTask = useCallback((id: string): TaskOperationResult<boolean> => {
    try {
      let found = false;

      setTasks(prevTasks => {
        found = prevTasks.some(task => task.id === id);
        return prevTasks.filter(task => task.id !== id);
      });

      if (!found) {
        return { success: false, error: `ID ${id} のタスクが見つかりません` };
      }

      return { success: true, data: true };
    } catch (error) {
      console.error('タスクの削除に失敗しました:', error);
      return { success: false, error: 'タスクの削除に失敗しました' };
    }
  }, []);

  // タスクを更新する
  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): TaskOperationResult<Task> => {
      try {
        let updatedTask: Task | undefined;

        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => {
            if (task.id === id) {
              updatedTask = {
                ...task,
                ...updates,
                updatedAt: new Date().toISOString(),
              };
              return updatedTask;
            }
            return task;
          });
          return updatedTasks;
        });

        if (!updatedTask) {
          return { success: false, error: `ID ${id} のタスクが見つかりません` };
        }

        return { success: true, data: updatedTask };
      } catch (error) {
        console.error('タスクの更新中にエラーが発生しました:', error);
        return { success: false, error: 'タスクの更新に失敗しました' };
      }
    },
    []
  );

  // タスクをリセットする
  const resetTasks = useCallback(() => {
    setTasks([]);
  }, []);

  // タスクをファイルに保存する
  const saveTasksToFile = useCallback(
    async (filename: string): Promise<TaskOperationResult<boolean>> => {
      try {
        if (!filename) {
          return { success: false, error: 'ファイル名が指定されていません' };
        }

        setLoading(true);
        await apiService.saveTasks(filename, tasks);
        setError(null);
        return { success: true, data: true };
      } catch (error) {
        console.error(`${filename} へのタスク保存に失敗しました:`, error);
        setError(`${filename} へのタスク保存に失敗しました`);
        return { success: false, error: `${filename} へのタスク保存に失敗しました` };
      } finally {
        setLoading(false);
      }
    },
    [tasks]
  );

  // アクティブタスクとアーカイブタスクを計算
  const activeTasks = tasks
    .filter(task => !task.completed)
    .reduce(
      (acc: Record<string, Task[]>, task: Task) => {
        const date = new Date(task.createdAt).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(task);
        return acc;
      },
      {} as Record<string, Task[]>
    );

  const archivedTasks = tasks
    .filter(task => task.completed)
    .reduce(
      (acc: Record<string, Task[]>, task: Task) => {
        const date = new Date(task.createdAt).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(task);
        return acc;
      },
      {} as Record<string, Task[]>
    );

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    activeTasks,
    archivedTasks,
    currentFile,
    availableFiles,
    loading,
    error,
    newTask,
    setNewTask,
    setCurrentFile,
    loadTasksFromFile,
    saveTasksToFile,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    resetTasks,
    fetchAvailableFiles,
    clearError,
  };
};
