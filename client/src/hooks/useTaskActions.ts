import { useCallback } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { apiClient } from '../services/apiClient';
import { Task, Priority } from '../types';

export const useTaskActions = () => {
  const { dispatch } = useTaskContext();

  // タスク一覧の取得
  const fetchTasks = useCallback(async (forceRefresh = false) => {
    dispatch({ type: 'FETCH_TASKS_START' });
    
    try {
      const tasks = await apiClient.fetchTasks(forceRefresh);
      dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: tasks });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_TASKS_ERROR', 
        payload: error instanceof Error ? error : new Error('タスクの取得に失敗しました') 
      });
    }
  }, [dispatch]);

  // タスクの追加
  const addTask = useCallback(async (
    title: string, 
    priority: Priority,
    category?: string,
    dueDate?: string,
    memo?: string
  ) => {
    dispatch({ type: 'ADD_TASK_START' });
    
    try {
      const newTask = await apiClient.createTask({
        title,
        priority,
        completed: false,
        ...(category && { category }),
        ...(dueDate && { dueDate }),
        ...(memo && { memo }),
      });
      
      dispatch({ type: 'ADD_TASK_SUCCESS', payload: newTask });
      return newTask;
    } catch (error) {
      dispatch({ 
        type: 'ADD_TASK_ERROR', 
        payload: error instanceof Error ? error : new Error('タスクの追加に失敗しました') 
      });
      throw error;
    }
  }, [dispatch]);

  // タスクの更新
  const updateTask = useCallback(async (task: Task) => {
    dispatch({ type: 'UPDATE_TASK_START', payload: task.id });
    
    try {
      const updatedTask = await apiClient.updateTask(task.id, task);
      dispatch({ type: 'UPDATE_TASK_SUCCESS', payload: updatedTask });
      return updatedTask;
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_TASK_ERROR', 
        payload: {
          id: task.id,
          error: error instanceof Error ? error : new Error('タスクの更新に失敗しました')
        }
      });
      throw error;
    }
  }, [dispatch]);

  // タスクの削除
  const deleteTask = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_TASK_START', payload: id });
    
    try {
      await apiClient.deleteTask(id);
      dispatch({ type: 'DELETE_TASK_SUCCESS', payload: id });
    } catch (error) {
      dispatch({ 
        type: 'DELETE_TASK_ERROR', 
        payload: {
          id,
          error: error instanceof Error ? error : new Error('タスクの削除に失敗しました')
        }
      });
      throw error;
    }
  }, [dispatch]);

  // タスクの完了状態の切り替え
  const toggleTaskCompletion = useCallback(async (id: string) => {
    dispatch({ type: 'TOGGLE_TASK_START', payload: id });
    
    try {
      const updatedTask = await apiClient.toggleTaskCompletion(id);
      dispatch({ type: 'TOGGLE_TASK_SUCCESS', payload: updatedTask });
    } catch (error) {
      dispatch({ 
        type: 'TOGGLE_TASK_ERROR', 
        payload: {
          id,
          error: error instanceof Error ? error : new Error('タスクの状態変更に失敗しました')
        }
      });
      throw error;
    }
  }, [dispatch]);

  // タスクのメモ更新
  const updateMemo = useCallback(async (id: string, memo: string) => {
    dispatch({ type: 'UPDATE_MEMO_START', payload: id });
    
    try {
      const updatedTask = await apiClient.updateTaskMemo(id, memo);
      dispatch({ type: 'UPDATE_MEMO_SUCCESS', payload: updatedTask });
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_MEMO_ERROR', 
        payload: {
          id,
          error: error instanceof Error ? error : new Error('メモの更新に失敗しました')
        }
      });
      throw error;
    }
  }, [dispatch]);

  return {
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateMemo,
  };
};
