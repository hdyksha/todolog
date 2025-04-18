import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, Priority, TaskFilter, TaskSort } from '../types';
import { webStorage } from '../services/fileService';

// ローカルストレージのキー
const STORAGE_KEY = 'todolog-tasks';

/**
 * タスク管理のカスタムフック
 * タスクの追加、更新、削除、フィルタリング、ソートなどの機能を提供
 */
export function useTasks() {
  // タスクの状態
  const [tasks, setTasks] = useState<Task[]>([]);
  // ローディング状態
  const [loading, setLoading] = useState(true);
  // エラー状態
  const [error, setError] = useState<Error | null>(null);
  // フィルター状態
  const [filter, setFilter] = useState<TaskFilter>({ status: 'all' });
  // ソート状態
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', direction: 'desc' });

  // 初期データのロード
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        // Web環境ではローカルストレージからデータを読み込む
        const data = webStorage.loadData<Task[]>(STORAGE_KEY);
        
        // 日付文字列をDateオブジェクトに変換
        const parsedTasks = data ? data.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        })) : [];
        
        setTasks(parsedTasks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // データ変更時の保存
  useEffect(() => {
    if (!loading) {
      try {
        webStorage.saveData(STORAGE_KEY, tasks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save tasks'));
      }
    }
  }, [tasks, loading]);

  // タスク追加
  const addTask = (
    title: string, 
    priority: Priority = Priority.Medium, 
    category?: string, 
    dueDate?: Date, 
    memo?: string
  ) => {
    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      priority,
      category,
      dueDate,
      memo,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // タスク更新
  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() } 
          : task
      )
    );
  };

  // タスク削除
  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // タスク完了状態の切り替え
  const toggleTaskCompletion = (id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { ...task, completed: !task.completed, updatedAt: new Date() } 
          : task
      )
    );
  };

  // メモの更新
  const updateMemo = (id: string, memo: string) => {
    updateTask(id, { memo });
  };

  // フィルターの適用
  const filteredTasks = tasks.filter(task => {
    // ステータスでフィルタリング
    if (filter.status === 'completed' && !task.completed) return false;
    if (filter.status === 'active' && task.completed) return false;
    
    // 優先度でフィルタリング
    if (filter.priority && task.priority !== filter.priority) return false;
    
    // カテゴリでフィルタリング
    if (filter.category && task.category !== filter.category) return false;
    
    // 検索語でフィルタリング
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const memoMatch = task.memo?.toLowerCase().includes(searchLower) || false;
      const categoryMatch = task.category?.toLowerCase().includes(searchLower) || false;
      
      if (!titleMatch && !memoMatch && !categoryMatch) return false;
    }
    
    return true;
  });

  // ソートの適用
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const { field, direction } = sort;
    const multiplier = direction === 'asc' ? 1 : -1;
    
    switch (field) {
      case 'title':
        return multiplier * a.title.localeCompare(b.title);
      case 'priority': {
        const priorityOrder = { [Priority.High]: 0, [Priority.Medium]: 1, [Priority.Low]: 2 };
        return multiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      }
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return multiplier;
        if (!b.dueDate) return -multiplier;
        return multiplier * (a.dueDate.getTime() - b.dueDate.getTime());
      case 'createdAt':
        return multiplier * (a.createdAt.getTime() - b.createdAt.getTime());
      case 'updatedAt':
        return multiplier * (a.updatedAt.getTime() - b.updatedAt.getTime());
      default:
        return 0;
    }
  });

  // 利用可能なカテゴリの一覧を取得
  const categories = Array.from(new Set(tasks.map(task => task.category).filter(Boolean) as string[]));

  return {
    tasks: sortedTasks,
    allTasks: tasks,
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
  };
}
