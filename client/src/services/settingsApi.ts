import { ServerSettings, UpdateServerSettings, TaskFile } from '../types/settings';

// APIのベースURL
const API_BASE_URL = '/api';

/**
 * サーバー側の設定を取得する
 * @returns サーバー側の設定
 */
export async function fetchServerSettings(): Promise<ServerSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`);
  if (!response.ok) {
    throw new Error('設定の取得に失敗しました');
  }
  return response.json();
}

/**
 * サーバー側の設定を更新する
 * @param updates 更新する設定
 * @returns 更新後の設定
 */
export async function updateServerSettings(updates: UpdateServerSettings): Promise<ServerSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('設定の更新に失敗しました');
  }
  
  return response.json();
}

/**
 * サーバー側の設定をリセットする
 * @returns リセット後の設定
 */
export async function resetServerSettings(): Promise<ServerSettings> {
  const response = await fetch(`${API_BASE_URL}/settings/reset`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('設定のリセットに失敗しました');
  }
  
  return response.json();
}

/**
 * データディレクトリを設定する
 * @param dataDir 新しいデータディレクトリのパス
 * @returns 更新後の設定
 */
export async function setDataDirectory(dataDir: string): Promise<ServerSettings> {
  const response = await fetch(`${API_BASE_URL}/settings/storage/data-dir`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dataDir }),
  });
  
  if (!response.ok) {
    throw new Error('データディレクトリの設定に失敗しました');
  }
  
  return response.json();
}

/**
 * 現在のタスクファイルを設定する
 * @param filename タスクファイル名
 * @returns 更新後の設定
 */
export async function setCurrentTaskFile(filename: string): Promise<ServerSettings> {
  const response = await fetch(`${API_BASE_URL}/settings/storage/current-file`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename }),
  });
  
  if (!response.ok) {
    throw new Error('タスクファイルの設定に失敗しました');
  }
  
  return response.json();
}

/**
 * 最近使用したタスクファイルのリストを取得する
 * @returns タスクファイル名の配列
 */
export async function fetchRecentTaskFiles(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/settings/storage/recent-files`);
  
  if (!response.ok) {
    throw new Error('最近使用したファイルの取得に失敗しました');
  }
  
  return response.json();
}

/**
 * タスクファイル一覧を取得する
 * @param extension フィルタリングする拡張子（例: '.json'）
 * @returns タスクファイル名の配列
 */
export async function fetchTaskFiles(extension?: string): Promise<string[]> {
  const url = extension 
    ? `${API_BASE_URL}/storage/files?extension=${encodeURIComponent(extension)}`
    : `${API_BASE_URL}/storage/files`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('ファイル一覧の取得に失敗しました');
  }
  
  return response.json();
}

/**
 * 新しいタスクファイルを作成する
 * @param filename ファイル名
 * @returns 作成結果
 */
export async function createTaskFile(filename: string): Promise<{ filename: string; message: string }> {
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
  
  return response.json();
}
