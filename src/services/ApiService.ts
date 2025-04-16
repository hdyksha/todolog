import { Task } from '../types/Task';
import { retryWithBackoff } from '../hooks/useErrorHandler';

// APIのベースURLを環境変数から取得（デフォルト値も設定）
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// APIレスポンスの型定義
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  status: 'success' | 'error';
}

// APIサービスの設定型
export interface ApiConfig {
  dataStoragePath: string;
  autoSaveInterval: number;
}

// タスクファイル情報の型
export interface TaskFile {
  name: string;
  path: string;
  lastModified: string;
}

/**
 * APIリクエストを実行する共通関数
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // レスポンスのステータスコードに基づいてエラーメッセージを生成
      let errorMessage = `HTTP error ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = `${errorMessage}: ${errorData.error || 'Unknown error'}`;
        }
      } catch (e) {
        // JSONのパースに失敗した場合は元のエラーメッセージを使用
      }

      const error = new Error(errorMessage);
      throw error;
    }

    const data = await response.json();
    return {
      data,
      status: 'success',
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: {
          code: 'request_failed',
          message: error.message,
        },
        status: 'error',
      };
    }

    return {
      error: {
        code: 'unknown_error',
        message: String(error),
      },
      status: 'error',
    };
  }
}

class ApiService {
  // 設定の取得
  async getConfig(): Promise<ApiConfig> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<ApiConfig>('/config');

      if (response.status === 'error') {
        throw new Error(response.error?.message || '設定の取得に失敗しました');
      }

      return (
        response.data || {
          dataStoragePath: './data',
          autoSaveInterval: 60000,
        }
      );
    });
  }

  // 設定の更新
  async updateConfig(config: Partial<ApiConfig>): Promise<ApiConfig> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<{ config: ApiConfig }>('/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });

      if (response.status === 'error') {
        throw new Error(response.error?.message || '設定の更新に失敗しました');
      }

      return (
        response.data?.config || {
          dataStoragePath: './data',
          autoSaveInterval: 60000,
        }
      );
    });
  }

  // 利用可能なタスクファイル一覧の取得
  async getTaskFiles(): Promise<TaskFile[]> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<TaskFile[]>('/files');

      if (response.status === 'error') {
        throw new Error(response.error?.message || 'ファイル一覧の取得に失敗しました');
      }

      return response.data || [];
    });
  }

  // 新しいタスクファイルの作成
  async createTaskFile(filename: string): Promise<TaskFile | null> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<{ file: TaskFile }>('/files', {
        method: 'POST',
        body: JSON.stringify({ filename }),
      });

      if (response.status === 'error') {
        throw new Error(response.error?.message || `ファイル ${filename} の作成に失敗しました`);
      }

      return response.data?.file || null;
    });
  }

  // タスクファイルの削除
  async deleteTaskFile(filename: string): Promise<boolean> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<{ success: boolean }>(
        `/files/${encodeURIComponent(filename)}`,
        {
          method: 'DELETE',
        }
      );

      if (response.status === 'error') {
        throw new Error(response.error?.message || `ファイル ${filename} の削除に失敗しました`);
      }

      return response.data?.success || false;
    });
  }

  // 特定のファイルからタスクを取得
  async getTasks(filename: string): Promise<Task[]> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<Task[]>(`/tasks/${encodeURIComponent(filename)}`);

      if (response.status === 'error') {
        throw new Error(
          response.error?.message || `ファイル ${filename} からのタスク取得に失敗しました`
        );
      }

      return response.data || [];
    });
  }

  // 特定のファイルにタスクを保存
  async saveTasks(filename: string, tasks: Task[]): Promise<boolean> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<{ success: boolean }>(
        `/tasks/${encodeURIComponent(filename)}`,
        {
          method: 'POST',
          body: JSON.stringify(tasks),
        }
      );

      if (response.status === 'error') {
        throw new Error(
          response.error?.message || `ファイル ${filename} へのタスク保存に失敗しました`
        );
      }

      return response.data?.success || false;
    });
  }
}

export const apiService = new ApiService();
