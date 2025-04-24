import { Task, Priority } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// APIレスポンスのエラーハンドリング
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
};

// タスク関連のAPI
export const apiClient = {
  // タスク一覧の取得
  async fetchTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    const tasks = await handleResponse(response);
    return tasks.map((task: any) => ({
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    }));
  },

  // タスクの作成
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    const task = await handleResponse(response);
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    };
  },

  // タスクの更新
  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    const task = await handleResponse(response);
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    };
  },

  // タスクの削除
  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },

  // タグ一覧の取得
  async fetchTags(): Promise<{ [key: string]: { color: string } }> {
    const response = await fetch(`${API_BASE_URL}/tags`);
    return handleResponse(response);
  },

  // タグの作成
  async createTag(tagName: string, color: string): Promise<{ [key: string]: { color: string } }> {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagName, color }),
    });
    return handleResponse(response);
  },

  // タグの削除
  async deleteTag(tagName: string): Promise<{ [key: string]: { color: string } }> {
    const response = await fetch(`${API_BASE_URL}/tags/${encodeURIComponent(tagName)}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // サーバー設定の取得
  async fetchServerSettings(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(response);
  },

  // サーバー設定の更新
  async updateServerSettings(settings: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  // タスクファイル一覧の取得
  async fetchTaskFiles(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/files`);
    return handleResponse(response);
  },

  // 最近使用したタスクファイル一覧の取得
  async fetchRecentFiles(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/files/recent`);
    return handleResponse(response);
  },

  // タスクファイルの切り替え
  async switchTaskFile(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/files/switch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });
    await handleResponse(response);
  },

  // 新しいタスクファイルの作成
  async createTaskFile(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });
    await handleResponse(response);
  },

  // タスクファイルの削除
  async deleteTaskFile(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/files/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },

  // 現在のタスクファイル名の取得
  async getCurrentFileName(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/files/current`);
    const data = await handleResponse(response);
    return data.filename;
  },

  // アーカイブされたタスクの取得
  async fetchArchivedTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/archived`);
    const tasks = await handleResponse(response);
    return tasks.map((task: any) => ({
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    }));
  },

  // タスクのアーカイブ
  async archiveTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/archive`, {
      method: 'POST',
    });
    await handleResponse(response);
  },

  // タスクのアーカイブ解除
  async unarchiveTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/unarchive`, {
      method: 'POST',
    });
    await handleResponse(response);
  },

  // アーカイブ統計情報の取得
  async fetchArchiveStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tasks/archived/stats`);
    return handleResponse(response);
  }
};

export default apiClient;
