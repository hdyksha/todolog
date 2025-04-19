import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config';

// APIエラーハンドリング
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
};

// バックアップ一覧を取得するクエリ
export function useBackups() {
  return useQuery({
    queryKey: ['backups'],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch(`${API_BASE_URL}/backups`);
      return handleApiResponse<string[]>(response);
    },
  });
}

// バックアップを作成するミューテーション
export function useCreateBackup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<{ filename: string }> => {
      const response = await fetch(`${API_BASE_URL}/backups`, {
        method: 'POST',
      });
      
      return handleApiResponse<{ filename: string }>(response);
    },
    onSuccess: () => {
      // バックアップ一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });
}

// バックアップから復元するミューテーション
export function useRestoreBackup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (filename: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/backups/${filename}/restore`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
    },
    onSuccess: () => {
      // タスク一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // カテゴリ一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// タスクデータをエクスポートする関数
export async function exportTasks(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  return response.blob();
}

// タスクデータをインポートするミューテーション
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
    },
    onSuccess: () => {
      // タスク一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // カテゴリ一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
