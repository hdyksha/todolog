import { useState, useCallback, useMemo } from 'react';
import { Task, TasksByDate, createTask, validateTask } from '../types/Task';
import { apiService } from '../services/ApiService';
import { useErrorContext } from '../contexts/ErrorContext';

/**
 * タスク操作の結果を表す型
 */
export interface TaskOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * タスク操作のためのカスタムフック
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorContext();

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
  const loadTasksFromFile = useCallback(
    async (filename: string): Promise<TaskOperationResult> => {
      if (!filename) return { success: false, error: 'ファイル名が指定されていません' };

      try {
        setLoading(true);
        const loadedTasks = await apiService.getTasks(filename);
        setTasks(loadedTasks);
        return { success: true };
      } catch (error) {
        handleError(error, async () => {
          await loadTasksFromFile(filename);
        });
        return { success: false, error: `タスクの読み込みに失敗しました: ${error}` };
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * タスクをファイルに保存
   */
  const saveTasksToFile = useCallback(
    async (filename: string): Promise<TaskOperationResult> => {
      if (!filename) return { success: false, error: 'ファイル名が指定されていません' };
      if (tasks.length === 0) return { success: true }; // 空のタスクリストも有効

      try {
        const success = await apiService.saveTasks(filename, tasks);
        if (!success) {
          return { success: false, error: 'タスクの保存に失敗しました' };
        }
        return { success: true };
      } catch (error) {
        handleError(error, async () => {
          await saveTasksToFile(filename);
        });
        return { success: false, error: `タスクの保存に失敗しました: ${error}` };
      }
    },
    [tasks, handleError]
  );

  /**
   * 新しいタスクを追加
   */
  const addTask = useCallback((text: string): TaskOperationResult<Task> => {
    if (!text.trim()) {
      return { success: false, error: 'タスクのテキストを入力してください' };
    }

    try {
      const newTaskObj = createTask(text.trim());
      const validationResult = validateTask(newTaskObj);

      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.errors.map(e => e.message).join(', '),
        };
      }

      setTasks(prevTasks => [...prevTasks, newTaskObj]);
      setNewTask('');
      return { success: true, data: newTaskObj };
    } catch (error) {
      return { success: false, error: `タスクの作成に失敗しました: ${error}` };
    }
  }, []);

  /**
   * タスクの完了状態を切り替え
   */
  const toggleTask = useCallback((id: string): TaskOperationResult<Task> => {
    let updatedTask: Task | undefined;

    try {
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
        return { success: false, error: 'タスクが見つかりませんでした' };
      }

      return { success: true, data: updatedTask };
    } catch (error) {
      return { success: false, error: `タスクの更新に失敗しました: ${error}` };
    }
  }, []);

  /**
   * タスクを削除
   */
  const deleteTask = useCallback((id: string): TaskOperationResult => {
    try {
      let deletedTask: Task | undefined;

      setTasks(prevTasks => {
        deletedTask = prevTasks.find(task => task.id === id);
        return prevTasks.filter(task => task.id !== id);
      });

      if (!deletedTask) {
        return { success: false, error: 'タスクが見つかりませんでした' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: `タスクの削除に失敗しました: ${error}` };
    }
  }, []);

  /**
   * タスクを更新
   */
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

              const validationResult = validateTask(updatedTask);
              if (!validationResult.isValid) {
                throw new Error(validationResult.errors.map(e => e.message).join(', '));
              }

              return updatedTask;
            }
            return task;
          });
          return updatedTasks;
        });

        if (!updatedTask) {
          return { success: false, error: 'タスクが見つかりませんでした' };
        }

        return { success: true, data: updatedTask };
      } catch (error) {
        return { success: false, error: `タスクの更新に失敗しました: ${error}` };
      }
    },
    []
  );

  /**
   * タスクをリセット
   */
  const resetTasks = useCallback(() => {
    setTasks([]);
    setNewTask('');
  }, []);

  return {
    tasks,
    activeTasks: groupedTasks.active,
    archivedTasks: groupedTasks.archived,
    newTask,
    loading,
    error: null, // エラーコンテキストを使用するため不要
    setNewTask,
    loadTasksFromFile,
    saveTasksToFile,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    resetTasks,
    clearError: () => {}, // エラーコンテキストを使用するため不要
  };
}
