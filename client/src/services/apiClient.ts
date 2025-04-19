import axios, { AxiosInstance, AxiosError } from 'axios';
import { Task } from '../types';

// APIのベースURL
const API_BASE_URL = 'http://localhost:3001/api';

// Axiosインスタンスの作成
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // エラーハンドリング
    const errorMessage = error.response?.data?.message || error.message || '不明なエラーが発生しました';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// タスクのキャッシュ
let tasksCache: Task[] | null = null;

// APIクライアント
export const apiClient = {
  // タスク一覧の取得
  async fetchTasks(forceRefresh = false): Promise<Task[]> {
    // キャッシュがあり、強制更新でなければキャッシュを返す
    if (tasksCache && !forceRefresh) {
      return tasksCache;
    }

    const response = await axiosInstance.get<Task[]>('/tasks');
    tasksCache = response.data;
    return response.data;
  },

  // 特定のタスクの取得
  async fetchTaskById(id: string): Promise<Task> {
    // キャッシュから検索
    if (tasksCache) {
      const cachedTask = tasksCache.find(task => task.id === id);
      if (cachedTask) {
        return cachedTask;
      }
    }

    const response = await axiosInstance.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  // タスクの作成
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await axiosInstance.post<Task>('/tasks', taskData);
    
    // キャッシュの更新
    if (tasksCache) {
      tasksCache = [...tasksCache, response.data];
    }
    
    return response.data;
  },

  // タスクの更新
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const response = await axiosInstance.put<Task>(`/tasks/${id}`, taskData);
    
    // キャッシュの更新
    if (tasksCache) {
      tasksCache = tasksCache.map(task => 
        task.id === id ? response.data : task
      );
    }
    
    return response.data;
  },

  // タスクの削除
  async deleteTask(id: string): Promise<void> {
    await axiosInstance.delete(`/tasks/${id}`);
    
    // キャッシュの更新
    if (tasksCache) {
      tasksCache = tasksCache.filter(task => task.id !== id);
    }
  },

  // タスクの完了状態の切り替え
  async toggleTaskCompletion(id: string): Promise<Task> {
    const response = await axiosInstance.put<Task>(`/tasks/${id}/toggle`);
    
    // キャッシュの更新
    if (tasksCache) {
      tasksCache = tasksCache.map(task => 
        task.id === id ? response.data : task
      );
    }
    
    return response.data;
  },

  // タスクのメモ更新
  async updateTaskMemo(id: string, memo: string): Promise<Task> {
    const response = await axiosInstance.put<Task>(`/tasks/${id}/memo`, { memo });
    
    // キャッシュの更新
    if (tasksCache) {
      tasksCache = tasksCache.map(task => 
        task.id === id ? response.data : task
      );
    }
    
    return response.data;
  },

  // カテゴリ一覧の取得
  async fetchCategories(): Promise<string[]> {
    const response = await axiosInstance.get<string[]>('/categories');
    return response.data;
  },

  // キャッシュのクリア
  clearCache() {
    tasksCache = null;
  }
};
