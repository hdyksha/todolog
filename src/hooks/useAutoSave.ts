import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../types/Task';
import { apiService } from '../services/ApiService';

interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

/**
 * タスクの自動保存のためのカスタムフック
 */
export function useAutoSave(
  tasks: Task[],
  currentFile: string,
  options: AutoSaveOptions = {}
) {
  const {
    enabled = true,
    interval,
    onSaveSuccess,
    onSaveError
  } = options;

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // タイマーIDを保持するためのref
  const timerRef = useRef<number | null>(null);
  
  // 前回のタスクと現在のファイルを保持するためのref
  const prevTasksRef = useRef<Task[]>([]);
  const prevFileRef = useRef<string>('');

  /**
   * 自動保存の設定を読み込む
   */
  const loadAutoSaveConfig = useCallback(async () => {
    try {
      const config = await apiService.getConfig();
      setAutoSaveInterval(interval || config.autoSaveInterval);
      return config.autoSaveInterval;
    } catch (err) {
      console.error('自動保存の設定の読み込みに失敗しました:', err);
      setError('自動保存の設定の読み込みに失敗しました');
      return 60000; // デフォルト値
    }
  }, [interval]);

  /**
   * タスクを保存する
   */
  const saveTasksNow = useCallback(async () => {
    if (!currentFile || tasks.length === 0) return false;
    
    try {
      setIsAutoSaving(true);
      await apiService.saveTasks(currentFile, tasks);
      setLastSaved(new Date());
      setError(null);
      onSaveSuccess?.();
      return true;
    } catch (err) {
      setError(`タスクの自動保存に失敗しました: ${currentFile}`);
      console.error(`タスクの自動保存エラー (${currentFile}):`, err);
      onSaveError?.(err);
      return false;
    } finally {
      setIsAutoSaving(false);
    }
  }, [currentFile, tasks, onSaveSuccess, onSaveError]);

  // タスクが変更されたときに保存
  useEffect(() => {
    // タスクまたはファイルが変更された場合のみ保存
    const tasksChanged = JSON.stringify(tasks) !== JSON.stringify(prevTasksRef.current);
    const fileChanged = currentFile !== prevFileRef.current;
    
    if ((tasksChanged || fileChanged) && tasks.length > 0 && currentFile) {
      const saveTask = async () => {
        await saveTasksNow();
        // 保存後に現在の状態を記録
        prevTasksRef.current = [...tasks];
        prevFileRef.current = currentFile;
      };
      
      saveTask();
    }
  }, [tasks, currentFile, saveTasksNow]);

  // 自動保存タイマーの設定
  useEffect(() => {
    const setupAutoSave = async () => {
      if (!enabled) return;
      
      // 既存のタイマーをクリア
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // 自動保存の間隔を取得
      const saveInterval = autoSaveInterval || await loadAutoSaveConfig();
      
      // 新しいタイマーを設定
      timerRef.current = window.setInterval(async () => {
        if (tasks.length > 0 && currentFile) {
          await saveTasksNow();
        }
      }, saveInterval);
    };

    setupAutoSave();

    // コンポーネントのアンマウント時にタイマーをクリア
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, autoSaveInterval, loadAutoSaveConfig, tasks, currentFile, saveTasksNow]);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAutoSaving,
    lastSaved,
    autoSaveInterval,
    error,
    saveTasksNow,
    clearError
  };
}
