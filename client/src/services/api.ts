import { Task, Priority } from '../types';

// APIのベースURL
// 開発環境ではViteのプロキシを使用するため、相対パスを使用
const API_BASE_URL = '/api';

/**
 * タスク一覧を取得する
 * @returns タスクの配列
 */
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) {
    throw new Error('タスクの取得に失敗しました');
  }
  return response.json();
}

/**
 * 特定のタスクを取得する
 * @param id タスクID
 * @returns タスク
 */
export async function fetchTaskById(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
  if (!response.ok) {
    throw new Error('タスクの取得に失敗しました');
  }
  return response.json();
}

/**
 * 新しいタスクを作成する
 * @param taskData タスクデータ
 * @returns 作成されたタスク
 */
export async function createTask(taskData: {
  title: string;
  priority?: Priority;
  category?: string;
  dueDate?: string;
  memo?: string;
}): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    throw new Error('タスクの作成に失敗しました');
  }
  
  return response.json();
}

/**
 * タスクを更新する
 * @param id タスクID
 * @param updates 更新データ
 * @returns 更新されたタスク
 */
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('タスクの更新に失敗しました');
  }
  
  return response.json();
}

/**
 * タスクを削除する
 * @param id タスクID
 */
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('タスクの削除に失敗しました');
  }
}

/**
 * タスクの完了状態を切り替える
 * @param id タスクID
 * @param completed 設定する完了状態
 * @returns 更新されたタスク
 */
export async function toggleTaskCompletion(id: string, completed?: boolean): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  });
  
  if (!response.ok) {
    throw new Error('タスクの完了状態の切り替えに失敗しました');
  }
  
  return response.json();
}

/**
 * タスクのメモを更新する
 * @param id タスクID
 * @param memo 新しいメモ
 * @returns 更新されたタスク
 */
export async function updateTaskMemo(id: string, memo: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/memo`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ memo }),
  });
  
  if (!response.ok) {
    throw new Error('メモの更新に失敗しました');
  }
  
  return response.json();
}

/**
 * カテゴリ一覧を取得する
 * @returns カテゴリの配列
 */
export async function fetchCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error('カテゴリの取得に失敗しました');
  }
  return response.json();
}
