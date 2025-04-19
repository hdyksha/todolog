import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, CreateTaskInput, UpdateTaskInput, Priority, TaskFilter, TaskSort } from '../../types';
import { API_BASE_URL, CACHE_CONFIG } from '../config';
import { handleApiResponse } from '../../utils/errorHandler';

/**
 * タスク一覧を取得するクエリフック
 * @param filter タスクのフィルター条件
 * @param sort タスクのソート条件
 */
export function useTasks(filter?: TaskFilter, sort?: TaskSort) {
  return useQuery({
    queryKey: ['tasks', filter, sort],
    queryFn: async (): Promise<Task[]> => {
      // フィルターとソートのクエリパラメータを構築
      const params = new URLSearchParams();
      
      if (filter) {
        if (filter.status) params.append('status', filter.status);
        if (filter.priority) params.append('priority', filter.priority);
        if (filter.category) params.append('category', filter.category);
        if (filter.searchTerm) params.append('search', filter.searchTerm);
        if (filter.dueDate) params.append('dueDate', filter.dueDate);
      }
      
      if (sort) {
        params.append('sortBy', sort.field);
        params.append('sortDirection', sort.direction);
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/tasks${queryString}`);
      return handleApiResponse<Task[]>(response);
    },
    staleTime: CACHE_CONFIG.staleTime,
    retry: CACHE_CONFIG.retry,
    retryDelay: CACHE_CONFIG.retryDelay,
  });
}

/**
 * 特定のタスクを取得するクエリフック
 * @param id タスクID
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async (): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
      return handleApiResponse<Task>(response);
    },
    enabled: !!id, // idが存在する場合のみクエリを実行
    staleTime: CACHE_CONFIG.staleTime,
    retry: CACHE_CONFIG.retry,
    retryDelay: CACHE_CONFIG.retryDelay,
  });
}

/**
 * タスク作成のミューテーションフック
 */
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
      // 楽観的更新: タスク一覧に新しいタスクを追加
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return [...oldTasks, newTask];
      });
      
      // タスク一覧のキャッシュを無効化して再取得を促す
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * タスク更新のミューテーションフック
 */
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
    onMutate: async ({ id, updates }) => {
      // 楽観的更新のために現在のキャッシュを保存
      await queryClient.cancelQueries({ queryKey: ['tasks', id] });
      const previousTask = queryClient.getQueryData<Task>(['tasks', id]);
      
      // 個別タスクのキャッシュを更新
      if (previousTask) {
        const updatedTask = { ...previousTask, ...updates, updatedAt: new Date().toISOString() };
        queryClient.setQueryData(['tasks', id], updatedTask);
        
        // タスク一覧も更新
        queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
          return oldTasks.map(task => task.id === id ? updatedTask : task);
        });
      }
      
      return { previousTask };
    },
    onError: (_, __, context) => {
      // エラー時に元の状態に戻す
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', context.previousTask.id], context.previousTask);
        
        // タスク一覧も元に戻す
        queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
          return oldTasks.map(task => 
            task.id === context.previousTask.id ? context.previousTask : task
          );
        });
      }
    },
    onSuccess: (updatedTask) => {
      // 成功時に最新のデータで更新
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      
      // タスク一覧も更新
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return oldTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      });
    },
  });
}

/**
 * タスク削除のミューテーションフック
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        return handleApiResponse<void>(response);
      }
    },
    onMutate: async (id) => {
      // 楽観的更新のために現在のキャッシュを保存
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      
      // タスク一覧から削除したタスクを除外
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return oldTasks.filter(task => task.id !== id);
      });
      
      // 個別タスクのキャッシュを削除
      queryClient.removeQueries({ queryKey: ['tasks', id] });
      
      return { previousTasks };
    },
    onError: (_, __, context) => {
      // エラー時に元の状態に戻す
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSuccess: () => {
      // タスク一覧のキャッシュを無効化して再取得を促す
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * タスクの完了状態を切り替えるミューテーションフック
 */
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
      await queryClient.cancelQueries({ queryKey: ['tasks', id] });
      const previousTask = queryClient.getQueryData<Task>(['tasks', id]);
      
      // 現在のタスクを取得
      let task: Task | undefined;
      
      // 個別タスクのキャッシュから取得
      if (previousTask) {
        task = previousTask;
      } else {
        // タスク一覧から取得
        const tasks = queryClient.getQueryData<Task[]>(['tasks']);
        task = tasks?.find(t => t.id === id);
      }
      
      if (task) {
        // 楽観的に完了状態を更新
        const updatedTask = { 
          ...task, 
          completed: !task.completed,
          updatedAt: new Date().toISOString()
        };
        
        // 個別タスクのキャッシュを更新
        queryClient.setQueryData(['tasks', id], updatedTask);
        
        // タスク一覧を更新
        queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
          return oldTasks.map(t => t.id === id ? updatedTask : t);
        });
      }
      
      return { previousTask };
    },
    onError: (_, id, context) => {
      // エラー時に元の状態に戻す
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', id], context.previousTask);
        
        // タスク一覧も元に戻す
        queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
          return oldTasks.map(task => 
            task.id === id ? context.previousTask : task
          );
        });
      }
    },
    onSuccess: (updatedTask) => {
      // 成功時に最新のデータで更新
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      
      // タスク一覧も更新
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return oldTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      });
    },
  });
}

/**
 * タスクのメモを更新するミューテーションフック
 */
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
    onMutate: async ({ id, memo }) => {
      // 楽観的更新のために現在のキャッシュを保存
      await queryClient.cancelQueries({ queryKey: ['tasks', id] });
      const previousTask = queryClient.getQueryData<Task>(['tasks', id]);
      
      if (previousTask) {
        // 楽観的にメモを更新
        const updatedTask = { 
          ...previousTask, 
          memo,
          updatedAt: new Date().toISOString()
        };
        
        // 個別タスクのキャッシュを更新
        queryClient.setQueryData(['tasks', id], updatedTask);
        
        // タスク一覧も更新
        queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
          return oldTasks.map(task => 
            task.id === id ? updatedTask : task
          );
        });
      }
      
      return { previousTask };
    },
    onError: (_, { id }, context) => {
      // エラー時に元の状態に戻す
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', id], context.previousTask);
        
        // タスク一覧も元に戻す
        queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
          return oldTasks.map(task => 
            task.id === id ? context.previousTask : task
          );
        });
      }
    },
    onSuccess: (updatedTask) => {
      // 成功時に最新のデータで更新
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      
      // タスク一覧も更新
      queryClient.setQueryData<Task[]>(['tasks'], (oldTasks = []) => {
        return oldTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
      });
    },
  });
}

/**
 * カテゴリ一覧を取得するクエリフック
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch(`${API_BASE_URL}/categories`);
      return handleApiResponse<string[]>(response);
    },
    staleTime: CACHE_CONFIG.staleTime * 12, // カテゴリは変更頻度が低いのでキャッシュ時間を長くする
    retry: CACHE_CONFIG.retry,
    retryDelay: CACHE_CONFIG.retryDelay,
  });
}
