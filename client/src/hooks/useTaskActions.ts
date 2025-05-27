import { useCallback } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import api from '../services/api';
import { Task, Priority } from '../types';

export const useTaskActions = () => {
  const { dispatch } = useTaskContext();

  // APIエラーを処理する共通関数
  const handleApiError = useCallback((error: unknown, errorType: string, id?: string) => {
    const errorMessage = error instanceof Error ? error : new Error(`${errorType}に失敗しました`);
    
    if (id) {
      return {
        id,
        error: errorMessage
      };
    }
    
    return errorMessage;
  }, []);

  // タスク一覧の取得
  const fetchTasks = useCallback(async (forceRefresh = false) => {
    dispatch({ type: 'FETCH_TASKS_START' });
    
    try {
      const tasks = await api.fetchTasks(forceRefresh);
      dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: tasks });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_TASKS_ERROR', 
        payload: handleApiError(error, 'タスクの取得')
      });
    }
  }, [dispatch, handleApiError]);

  // タスクの追加
  const addTask = useCallback(async (
    title: string, 
    priority: Priority,
    tags?: string[],
    dueDate?: string,
    memo?: string
  ) => {
    dispatch({ type: 'ADD_TASK_START' });
    
    try {
      const newTask = await api.createTask({
        title,
        priority,
        completed: false,
        ...(tags && { tags }),
        ...(dueDate && { dueDate }),
        ...(memo && { memo }),
      });
      
      dispatch({ type: 'ADD_TASK_SUCCESS', payload: newTask });
      return newTask;
    } catch (error) {
      dispatch({ 
        type: 'ADD_TASK_ERROR', 
        payload: handleApiError(error, 'タスクの追加')
      });
      throw error;
    }
  }, [dispatch, handleApiError]);

  // タスクの更新
  const updateTask = useCallback(async (task: Task) => {
    dispatch({ type: 'UPDATE_TASK_START', payload: task.id });
    
    try {
      const updatedTask = await api.updateTask(task.id, task);
      dispatch({ type: 'UPDATE_TASK_SUCCESS', payload: updatedTask });
      return updatedTask;
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_TASK_ERROR', 
        payload: handleApiError(error, 'タスクの更新', task.id)
      });
      throw error;
    }
  }, [dispatch, handleApiError]);

  // タスクの削除
  const deleteTask = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_TASK_START', payload: id });
    
    try {
      await api.deleteTask(id);
      dispatch({ type: 'DELETE_TASK_SUCCESS', payload: id });
    } catch (error) {
      dispatch({ 
        type: 'DELETE_TASK_ERROR', 
        payload: handleApiError(error, 'タスクの削除', id)
      });
      throw error;
    }
  }, [dispatch, handleApiError]);

  // タスクの完了状態の切り替え
  const toggleTaskCompletion = useCallback(async (id: string) => {
    dispatch({ type: 'TOGGLE_TASK_START', payload: id });
    
    try {
      const updatedTask = await api.toggleTaskCompletion(id);
      // completedAt フィールドを含む更新されたタスクを処理
      dispatch({ type: 'TOGGLE_TASK_SUCCESS', payload: updatedTask });
      return updatedTask;
    } catch (error) {
      dispatch({ 
        type: 'TOGGLE_TASK_ERROR', 
        payload: handleApiError(error, 'タスクの状態変更', id)
      });
      throw error;
    }
  }, [dispatch, handleApiError]);

  // タスクのメモ更新
  const updateMemo = useCallback(async (id: string, memo: string) => {
    dispatch({ type: 'UPDATE_MEMO_START', payload: id });
    
    try {
      const updatedTask = await api.updateTaskMemo(id, memo);
      dispatch({ type: 'UPDATE_MEMO_SUCCESS', payload: updatedTask });
      return updatedTask;
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_MEMO_ERROR', 
        payload: handleApiError(error, 'メモの更新', id)
      });
      throw error;
    }
  }, [dispatch, handleApiError]);

  // タスクのタイトル更新
  const updateTitle = useCallback(async (id: string, title: string) => {
    dispatch({ type: 'UPDATE_TITLE_START', payload: id });
    
    try {
      const updatedTask = await api.updateTaskTitle(id, title);
      dispatch({ type: 'UPDATE_TITLE_SUCCESS', payload: updatedTask });
      return updatedTask;
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_TITLE_ERROR', 
        payload: handleApiError(error, 'タイトルの更新', id)
      });
      throw error;
    }
  }, [dispatch, handleApiError]);

  return {
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateMemo,
    updateTitle,
  };
};
