import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL, CACHE_CONFIG } from '../config';
import { handleApiResponse } from '../../utils/errorHandler';

/**
 * バックアップ一覧を取得するクエリフック
 */
export function useBackups() {
  return useQuery({
    queryKey: ['backups'],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch(`${API_BASE_URL}/backups`);
      return handleApiResponse<string[]>(response);
    },
    staleTime: CACHE_CONFIG.staleTime,
    retry: CACHE_CONFIG.retry,
    retryDelay: CACHE_CONFIG.retryDelay,
  });
}

/**
 * バックアップを作成するミューテーションフック
 */
export function useCreateBackup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<{ filename: string }> => {
      const response = await fetch(`${API_BASE_URL}/backups`, {
        method: 'POST',
      });
      
      return handleApiResponse<{ filename: string }>(response);
    },
    onSuccess: (data) => {
      // 楽観的更新: バックアップ一覧に新しいバックアップを追加
      queryClient.setQueryData<string[]>(['backups'], (oldBackups = []) => {
        return [...oldBackups, data.filename];
      });
      
      // バックアップ一覧のキャッシュを無効化して再取得を促す
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });
}

/**
 * バックアップから復元するミューテーションフック
 */
export function useRestoreBackup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (filename: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/backups/${filename}/restore`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        return handleApiResponse<void>(response);
      }
    },
    onSuccess: () => {
      // 復元後はすべての関連データを再取得
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/**
 * タスクデータをエクスポートする関数
 * @returns エクスポートされたデータのBlob
 */
export async function exportTasks(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export`);
  
  if (!response.ok) {
    return handleApiResponse<Blob>(response);
  }
  
  return response.blob();
}

/**
 * タスクデータをインポートするミューテーションフック
 */
export function useImportTasks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/import`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        return handleApiResponse<void>(response);
      }
    },
    onSuccess: () => {
      // インポート後はすべての関連データを再取得
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/**
 * ダウンロードヘルパー関数
 * @param blob ダウンロードするデータ
 * @param filename ファイル名
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
