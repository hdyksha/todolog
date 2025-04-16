import { Task } from '../types/Task';
import { retryWithBackoff } from '../hooks/useErrorHandler';

// APIのベースURLを環境変数から取得（デフォルト値も設定）
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

/**
 * APIレスポンスの型定義
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: ApiResponseStatus;
}

/**
 * APIレスポンスのステータス型
 */
export type ApiResponseStatus = 'success' | 'error';

/**
 * APIエラーの型定義
 */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: string;
}

/**
 * APIエラーコードの型定義
 */
export type ApiErrorCode =
  | 'not_found'
  | 'validation_error'
  | 'permission_denied'
  | 'server_error'
  | 'network_error'
  | 'request_failed'
  | 'unknown_error';

/**
 * APIサービスの設定型
 */
export interface ApiConfig {
  dataStoragePath: string;
  autoSaveInterval: number;
}

/**
 * タスクファイル情報の型
 */
export interface TaskFile {
  name: string;
  path: string;
  lastModified: string;
}

/**
 * APIリクエストオプションの型定義
 */
export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * APIリクエストを実行する共通関数
 */
async function fetchApi<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = 10000, ...fetchOptions } = options;

  try {
    // タイムアウト処理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // レスポンスのステータスコードに基づいてエラーコードを決定
      let errorCode: ApiErrorCode = 'unknown_error';

      switch (response.status) {
        case 404:
          errorCode = 'not_found';
          break;
        case 400:
          errorCode = 'validation_error';
          break;
        case 401:
        case 403:
          errorCode = 'permission_denied';
          break;
        case 500:
          errorCode = 'server_error';
          break;
        default:
          errorCode = 'unknown_error';
      }

      // エラーメッセージの取得
      let errorMessage = `HTTP error ${response.status}`;
      let errorDetails: string | undefined;

      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error.message || errorMessage;
          errorDetails = errorData.error.details;
        }
      } catch (e) {
        // JSONのパースに失敗した場合は元のエラーメッセージを使用
      }

      return {
        error: {
          code: errorCode,
          message: errorMessage,
          details: errorDetails,
        },
        status: 'error',
      };
    }

    const data = await response.json();
    return {
      data,
      status: 'success',
    };
  } catch (error) {
    if (error instanceof Error) {
      // エラータイプに基づいてエラーコードを決定
      let errorCode: ApiErrorCode = 'unknown_error';

      if (error.name === 'AbortError') {
        errorCode = 'network_error';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorCode = 'network_error';
      } else {
        errorCode = 'request_failed';
      }

      return {
        error: {
          code: errorCode,
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

/**
 * APIサービスクラス
 */
class ApiService {
  /**
   * 設定の取得
   */
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

  /**
   * 設定の更新
   */
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

  /**
   * 利用可能なタスクファイル一覧の取得
   */
  async getTaskFiles(): Promise<TaskFile[]> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<TaskFile[]>('/files');

      if (response.status === 'error') {
        throw new Error(response.error?.message || 'ファイル一覧の取得に失敗しました');
      }

      return response.data || [];
    });
  }

  /**
   * 新しいタスクファイルの作成
   */
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

  /**
   * タスクファイルの削除
   */
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

  /**
   * 特定のファイルからタスクを取得
   */
  async getTasks(filename: string): Promise<Task[]> {
    return retryWithBackoff(async () => {
      const response = await fetchApi<Task[]>(`/tasks/${encodeURIComponent(filename)}`);

      if (response.status === 'error') {
        throw new Error(
          response.error?.message || `ファイル ${filename} からのタスク取得に失敗しました`
        );
      }

      console.log(`API: ${filename} から ${response.data?.length || 0} 件のタスクを取得しました`);
      return response.data || [];
    });
  }

  /**
   * 特定のファイルにタスクを保存
   */
  async saveTasks(filename: string, tasks: Task[]): Promise<boolean> {
    return retryWithBackoff(async () => {
      console.log(`API: ${filename} に ${tasks.length} 件のタスクを保存します`);
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
