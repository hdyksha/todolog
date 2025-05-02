import { useCallback, useState } from 'react';
import { useTaskActions } from './useTaskActions';
import { Priority, Task } from '../types';
import api from '../services/api';
import { debounce } from '../utils/debounce';

/**
 * タスクのメタデータ（優先度、タグ、締切日）を編集するためのカスタムフック
 */
export const useTaskMetadataActions = (taskId: string) => {
  const { updateTask } = useTaskActions();

  // 優先度の更新
  const updatePriority = useCallback(async (priority: Priority) => {
    try {
      // APIを呼び出してタスクの優先度を更新
      const updatedTask = await api.updateTask(taskId, { priority });
      return updatedTask;
    } catch (error) {
      console.error('優先度の更新に失敗しました:', error);
      throw error;
    }
  }, [taskId]);

  // タグの更新
  const updateTags = useCallback(async (tags: string[]) => {
    try {
      // APIを呼び出してタスクのタグを更新
      const updatedTask = await api.updateTask(taskId, { tags });
      return updatedTask;
    } catch (error) {
      console.error('タグの更新に失敗しました:', error);
      throw error;
    }
  }, [taskId]);

  // 締切日の更新（デバウンス処理を追加）
  const updateDueDateWithDebounce = useCallback(
    debounce(async (dueDate: string | null) => {
      try {
        // APIを呼び出してタスクの締切日を更新
        const updatedTask = await api.updateTask(taskId, { dueDate });
        return updatedTask;
      } catch (error) {
        console.error('締切日の更新に失敗しました:', error);
        throw error;
      }
    }, 300),
    [taskId]
  );

  // 締切日の更新（通常版）
  const updateDueDate = useCallback(async (dueDate: string | null) => {
    try {
      // APIを呼び出してタスクの締切日を更新
      const updatedTask = await api.updateTask(taskId, { dueDate });
      return updatedTask;
    } catch (error) {
      console.error('締切日の更新に失敗しました:', error);
      throw error;
    }
  }, [taskId]);

  return {
    updatePriority,
    updateTags,
    updateDueDate,
    updateDueDateWithDebounce,
  };
};

export default useTaskMetadataActions;
