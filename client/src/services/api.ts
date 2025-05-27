import { Task, Priority, Tag } from '../types';

// APIのベースURL
// 開発環境ではViteのプロキシを使用するため、相対パスを使用
const API_BASE_URL = '/api';

// APIレスポンスのエラーハンドリング
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
};

// タスク関連のAPI
export const api = {
  // タスク一覧の取得
  async fetchTasks(forceRefresh = false): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      cache: forceRefresh ? 'no-store' : 'default',
      headers: {
        'Pragma': forceRefresh ? 'no-cache' : '',
        'Cache-Control': forceRefresh ? 'no-cache' : ''
      }
    });
    if (!response.ok) {
      throw new Error('タスクの取得に失敗しました');
    }
    const tasks = await response.json();
    return tasks.map((task: any) => ({
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    }));
  },

  // 特定のタスクを取得する
  async fetchTaskById(id: string, forceRefresh = false): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      cache: forceRefresh ? 'no-store' : 'default',
      headers: {
        'Pragma': forceRefresh ? 'no-cache' : '',
        'Cache-Control': forceRefresh ? 'no-cache' : ''
      }
    });
    if (!response.ok) {
      throw new Error('タスクの取得に失敗しました');
    }
    const task = await response.json();
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    };
  },

  // 新しいタスクを作成する
  async createTask(taskData: {
    title: string;
    priority?: Priority;
    tags?: string[];
    dueDate?: string;
    memo?: string;
  }): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      throw new Error('タスクの作成に失敗しました');
    }
    
    const task = await response.json();
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    };
  },

  // タスクを更新する
  async updateTask(
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('タスクの更新に失敗しました');
    }
    
    const task = await response.json();
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    };
  },

  // タスクを削除する
  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('タスクの削除に失敗しました');
    }
  },

  // タスクの完了状態を切り替える
  async toggleTaskCompletion(id: string, completed?: boolean): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ completed }),
    });
    
    if (!response.ok) {
      throw new Error('タスクの完了状態の切り替えに失敗しました');
    }
    
    const task = await response.json();
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    };
  },

  // タスクのメモを更新する
  async updateTaskMemo(id: string, memo: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/memo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ memo }),
    });
    
    if (!response.ok) {
      throw new Error('メモの更新に失敗しました');
    }
    
    const task = await response.json();
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    };
  },

  // タスクのタイトルを更新する
  async updateTaskTitle(id: string, title: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error('タイトルの更新に失敗しました');
    }
    
    const task = await response.json();
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate ? task.dueDate : null
    };
  },

  // カテゴリ一覧を取得する
  async fetchCategories(forceRefresh = false): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      cache: forceRefresh ? 'no-store' : 'default',
      headers: {
        'Pragma': forceRefresh ? 'no-cache' : '',
        'Cache-Control': forceRefresh ? 'no-cache' : ''
      }
    });
    if (!response.ok) {
      throw new Error('カテゴリの取得に失敗しました');
    }
    return response.json();
  },

  // タグ一覧の取得
  async fetchTags(): Promise<Record<string, Tag>> {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) {
      throw new Error('タグの取得に失敗しました');
    }
    return response.json();
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
    if (!response.ok) {
      throw new Error('タグの作成に失敗しました');
    }
    return response.json();
  },

  // タグの削除
  async deleteTag(tagName: string): Promise<{ [key: string]: { color: string } }> {
    const response = await fetch(`${API_BASE_URL}/tags/${encodeURIComponent(tagName)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('タグの削除に失敗しました');
    }
    return response.json();
  },

  // サーバー設定の取得
  async fetchServerSettings(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) {
      throw new Error('サーバー設定の取得に失敗しました');
    }
    return response.json();
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
    if (!response.ok) {
      throw new Error('サーバー設定の更新に失敗しました');
    }
    return response.json();
  },

  // タスクファイル一覧の取得
  async fetchTaskFiles(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/storage/files`);
    if (!response.ok) {
      throw new Error('タスクファイル一覧の取得に失敗しました');
    }
    return response.json();
  },

  // 最近使用したタスクファイル一覧の取得
  async fetchRecentFiles(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/settings/storage/recent-files`);
    if (!response.ok) {
      throw new Error('最近使用したファイル一覧の取得に失敗しました');
    }
    return response.json();
  },

  // タスクファイルの切り替え
  async switchTaskFile(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/settings/storage/current-file`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });
    if (!response.ok) {
      throw new Error('タスクファイルの切り替えに失敗しました');
    }
  },

  // 新しいタスクファイルの作成
  async createTaskFile(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/storage/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });
    if (!response.ok) {
      throw new Error('タスクファイルの作成に失敗しました');
    }
  },

  // タスクファイルの削除
  async deleteTaskFile(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/storage/files/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('タスクファイルの削除に失敗しました');
    }
  },

  // 現在のタスクファイル名の取得
  async getCurrentFileName(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/settings/storage/current-file`);
    if (!response.ok) {
      throw new Error('現在のタスクファイル名の取得に失敗しました');
    }
    const data = await response.json();
    return data.filename;
  },

  // アーカイブされたタスクの取得
  async fetchArchivedTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/archived`);
    if (!response.ok) {
      throw new Error('アーカイブされたタスクの取得に失敗しました');
    }
    const tasks = await response.json();
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
    if (!response.ok) {
      throw new Error('タスクのアーカイブに失敗しました');
    }
  },

  // タスクのアーカイブ解除
  async unarchiveTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/unarchive`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('タスクのアーカイブ解除に失敗しました');
    }
  },

  // アーカイブ統計情報の取得
  async fetchArchiveStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tasks/archived/stats`);
    if (!response.ok) {
      throw new Error('アーカイブ統計情報の取得に失敗しました');
    }
    return response.json();
  }
};

export default api;
