import { useState, useEffect, useCallback } from 'react';
import * as settingsApi from '../services/settingsApi';

/**
 * タスクファイル管理用のカスタムフック
 */
export function useTaskFiles() {
  const [taskFiles, setTaskFiles] = useState<string[]>([]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // タスクファイル一覧を取得する
  const fetchTaskFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await settingsApi.fetchTaskFiles('.json');
      setTaskFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイル一覧の取得に失敗しました');
      console.error('ファイル一覧の取得に失敗しました:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 最近使用したタスクファイル一覧を取得する
  const fetchRecentFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await settingsApi.fetchRecentTaskFiles();
      setRecentFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : '最近使用したファイルの取得に失敗しました');
      console.error('最近使用したファイルの取得に失敗しました:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 新しいタスクファイルを作成する
  const createNewTaskFile = useCallback(async (filename: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await settingsApi.createTaskFile(filename);
      // 作成後にファイル一覧を再取得
      await fetchTaskFiles();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの作成に失敗しました');
      console.error('タスクファイルの作成に失敗しました:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTaskFiles]);

  // 現在のタスクファイルを切り替える
  const switchTaskFile = useCallback(async (filename: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await settingsApi.setCurrentTaskFile(filename);
      // 切り替え後に最近使用したファイル一覧を再取得
      await fetchRecentFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの切り替えに失敗しました');
      console.error('タスクファイルの切り替えに失敗しました:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecentFiles]);

  // 初回マウント時にファイル一覧と最近使用したファイル一覧を取得
  useEffect(() => {
    fetchTaskFiles();
    fetchRecentFiles();
  }, [fetchTaskFiles, fetchRecentFiles]);

  return {
    taskFiles,
    recentFiles,
    isLoading,
    error,
    fetchTaskFiles,
    fetchRecentFiles,
    createNewTaskFile,
    switchTaskFile,
  };
}
