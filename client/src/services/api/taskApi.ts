import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, CreateTaskInput, UpdateTaskInput, Priority } from '../../types';
import { API_BASE_URL } from '../config';

// APIエラーハンドリング
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
};

// タスク一覧を取得するクエリ
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      return handleApiResponse<Task[]>(response);
    },
  });
}

// 特定のタスクを取得するクエリ
export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async (): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
      return handleApiResponse<Task>(response);
    },
    enabled: !!id, // idが存在する場合のみクエリを実行
  });
}

// タスク作成のミューテーション
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: CreateTaskInput): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      return handleApiResponse<Task>(response);
    },
    onSuccess: (newTask) => {
      // タスク一覧を更新
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return [...oldTasks, newTask];
      });
      
      // タスク一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// タスク更新のミューテーション
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: UpdateTaskInput }): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      return handleApiResponse<Task>(response);
    },
    onSuccess: (updatedTask) => {
      // 個別タスクのキャッシュを更新
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      
      // タスク一覧を更新
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return oldTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      });
    },
  });
}

// タスク削除のミューテーション
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
    },
    onSuccess: (_, id) => {
      // タスク一覧から削除したタスクを除外
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return oldTasks.filter(task => task.id !== id);
      });
      
      // 個別タスクのキャッシュを削除
      queryClient.removeQueries({ queryKey: ['tasks', id] });
    },
  });
}

// タスクの完了状態を切り替えるミューテーション
export function useToggleTaskCompletion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return handleApiResponse<Task>(response);
    },
    onMutate: async (id) => {
      // 楽観的更新のために現在のキャッシュを保存
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      const previousTask = queryClient.getQueryData<Task>(['tasks', id]);
      
      // 現在のタスクを取得
      const task = previousTasks?.find(t => t.id === id);
      
      if (task) {
        // 楽観的に完了状態を更新
        const updatedTask = { ...task, completed: !task.completed };
        
        // タスク一覧を更新
        queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
          return oldTasks.map(t => t.id === id ? updatedTask : t);
        });
        
        // 個別タスクを更新
        queryClient.setQueryData(['tasks', id], updatedTask);
      }
      
      // ロールバック用のコンテキストを返す
      return { previousTasks, previousTask };
    },
    onError: (_, __, context) => {
      // エラー時に元の状態に戻す
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', context.previousTask.id], context.previousTask);
      }
    },
    onSuccess: (updatedTask) => {
      // 成功時に最新のデータで更新
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return oldTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      });
    },
  });
}

// タスクのメモを更新するミューテーション
export function useUpdateTaskMemo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, memo }: { id: string, memo: string }): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/memo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memo }),
      });
      
      return handleApiResponse<Task>(response);
    },
    onSuccess: (updatedTask) => {
      // 個別タスクのキャッシュを更新
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      
      // タスク一覧を更新
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return oldTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      });
    },
  });
}

// カテゴリ一覧を取得するクエリ
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch(`${API_BASE_URL}/categories`);
      return handleApiResponse<string[]>(response);
    },
  });
}
