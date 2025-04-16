import { Task } from '../types/Task';

// APIのベースURLを環境変数から取得（デフォルト値も設定）
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

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

class ApiService {
  // 設定の取得
  async getConfig(): Promise<ApiConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/config`);
      if (!response.ok) {
        throw new Error(`設定の取得に失敗しました: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('設定の取得中にエラーが発生しました:', error);
      // デフォルト設定を返す
      return {
        dataStoragePath: './data',
        autoSaveInterval: 60000,
      };
    }
  }

  // 設定の更新
  async updateConfig(config: Partial<ApiConfig>): Promise<ApiConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`設定の更新に失敗しました: ${response.statusText}`);
      }

      const result = await response.json();
      return result.config;
    } catch (error) {
      console.error('設定の更新中にエラーが発生しました:', error);
      throw error;
    }
  }

  // 利用可能なタスクファイル一覧の取得
  async getTaskFiles(): Promise<TaskFile[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
      if (!response.ok) {
        throw new Error(`ファイル一覧の取得に失敗しました: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('ファイル一覧の取得中にエラーが発生しました:', error);
      return [];
    }
  }

  // 新しいタスクファイルの作成
  async createTaskFile(filename: string): Promise<TaskFile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `ファイルの作成に失敗しました: ${response.statusText}`);
      }

      const result = await response.json();
      return result.file;
    } catch (error) {
      console.error('ファイルの作成中にエラーが発生しました:', error);
      throw error;
    }
  }

  // タスクファイルの削除
  async deleteTaskFile(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `ファイルの削除に失敗しました: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('ファイルの削除中にエラーが発生しました:', error);
      throw error;
    }
  }

  // 特定のファイルからタスクを取得
  async getTasks(filename: string): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(filename)}`);
      if (!response.ok) {
        throw new Error(`タスクの取得に失敗しました: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`タスクの取得中にエラーが発生しました (${filename}):`, error);
      return [];
    }
  }

  // 特定のファイルにタスクを保存
  async saveTasks(filename: string, tasks: Task[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(filename)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tasks),
      });

      if (!response.ok) {
        throw new Error(`タスクの保存に失敗しました: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error(`タスクの保存中にエラーが発生しました (${filename}):`, error);
      return false;
    }
  }
}

export const apiService = new ApiService();
