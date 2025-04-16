import { useCallback, useEffect, useRef, useState } from 'react';
import { Task } from '../types/Task';
import { apiService } from '../services/ApiService';

/**
 * 自動保存の設定オプション
 */
export interface AutoSaveOptions {
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
  interval?: number;
}

/**
 * 自動保存フックの戻り値の型
 */
export interface AutoSaveHook {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveTasksNow: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * タスクの自動保存を管理するカスタムフック
 * @param tasks 現在のタスクリスト
 * @param currentFile 現在のファイル名
 * @param options 自動保存オプション
 * @returns 自動保存の状態と操作関数
 */
export const useAutoSave = (
  tasks: Task[],
  currentFile: string | null,
  options: AutoSaveOptions = {}
): AutoSaveHook => {
  const { onSaveSuccess, onSaveError, interval = 60000 } = options;

  // 自動保存の状態
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 前回の状態を保持するためのRef
  const prevTasksRef = useRef<string>('[]');
  const prevFileRef = useRef<string | null>(null);

  // 最後に保存した状態を保持するためのRef
  const lastSavedTasksRef = useRef<string | null>(null);
  const lastSavedFileRef = useRef<string | null>(null);

  // 自動保存のタイマーID
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // エラーをクリアする関数
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // タスクを保存する関数
  const saveTasksNow = useCallback(async (): Promise<boolean> => {
    if (!currentFile) {
      setError('ファイルが選択されていないため保存できません');
      return false;
    }

    // タスクの変更があるかチェック
    const tasksChanged = prevTasksRef.current !== JSON.stringify(tasks);

    // 変更がない場合は保存しない
    if (!tasksChanged) {
      console.log(`${currentFile} のタスクに変更がないため保存をスキップします`);
      return true;
    }

    // 空のタスクリストへの変更を検出して警告
    if (tasks.length === 0 && JSON.parse(lastSavedTasksRef.current || '[]').length > 0) {
      console.warn(
        `警告: 空のタスクリストを保存しようとしています。前回: ${JSON.parse(lastSavedTasksRef.current || '[]').length}件 -> 現在: 0件`
      );

      // 空のタスクリストの場合は追加の確認
      if (!window.confirm('全てのタスクが削除されています。このまま保存しますか？')) {
        console.log('空のタスクリストの保存をキャンセルしました');
        return false;
      }
    }

    try {
      setIsAutoSaving(true);
      console.log(`${currentFile} のタスクを保存します`);
      await apiService.saveTasks(currentFile, tasks);
      console.log(`${currentFile} のタスク保存が完了しました`);

      // 保存に成功したら最後に保存した状態を更新
      lastSavedTasksRef.current = JSON.stringify(tasks);
      lastSavedFileRef.current = currentFile;

      // 現在の状態も更新
      prevTasksRef.current = JSON.stringify(tasks);

      // 最終保存時刻を更新
      setLastSaved(new Date());

      // エラーをクリア
      setError(null);

      // 成功コールバックを呼び出し
      onSaveSuccess?.();

      return true;
    } catch (error) {
      console.error(`タスクの保存中にエラーが発生しました:`, error);
      setError(
        `タスクの保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`
      );

      // エラーコールバックを呼び出し
      onSaveError?.(error);

      return false;
    } finally {
      setIsAutoSaving(false);
    }
  }, [currentFile, tasks, onSaveSuccess, onSaveError]);

  // ファイルが変更されたときの処理
  useEffect(() => {
    if (currentFile && currentFile !== prevFileRef.current) {
      console.log(`ファイルが変更されました: ${prevFileRef.current || 'なし'} -> ${currentFile}`);

      // 前回のファイルのタスクに変更があれば保存
      const prevTasksChanged =
        prevTasksRef.current !== '[]' &&
        prevFileRef.current &&
        prevFileRef.current === lastSavedFileRef.current;

      if (prevTasksChanged) {
        console.log(`前回のファイル ${prevFileRef.current} のタスクを保存します`);
        // 非同期で前回のファイルを保存
        apiService
          .saveTasks(prevFileRef.current!, JSON.parse(prevTasksRef.current))
          .then(() => console.log(`前回のファイル ${prevFileRef.current} の保存が完了しました`))
          .catch(error => console.error(`前回のファイルの保存中にエラーが発生しました: ${error}`));
      }

      // 状態を更新
      prevTasksRef.current = JSON.stringify(tasks);
      prevFileRef.current = currentFile;

      // 初期状態も保存状態として記録
      lastSavedFileRef.current = currentFile;
      lastSavedTasksRef.current = JSON.stringify(tasks);
    }
  }, [currentFile, tasks]);

  // タスクが変更されたときの処理
  useEffect(() => {
    // 現在の状態をJSON文字列に変換
    const currentTasksJson = JSON.stringify(tasks);

    // タスクの変更があるかチェック
    const tasksChanged = prevTasksRef.current !== currentTasksJson;

    // ファイルの変更があるかチェック
    const fileChanged = currentFile !== prevFileRef.current;

    if (tasksChanged && currentFile && currentFile === lastSavedFileRef.current) {
      console.log(`タスクが変更されました: ${currentFile}`);
      console.log(`前回の状態: ${prevTasksRef.current}`);
      console.log(`現在の状態: ${JSON.stringify(tasks)}`);

      // 空のタスクリストへの変更を検出して警告
      if (tasks.length === 0 && JSON.parse(prevTasksRef.current).length > 0) {
        console.warn(
          `警告: タスクが全て削除されました。前回: ${JSON.parse(prevTasksRef.current).length}件 -> 現在: 0件`
        );
      }

      const saveTask = async () => {
        await saveTasksNow();
      };
      saveTask();
    } else if (fileChanged) {
      console.log(`ファイルが変更されました: ${prevFileRef.current || 'なし'} -> ${currentFile}`);
      // ファイルが変更された場合は状態を更新するだけ
      prevFileRef.current = currentFile;
      prevTasksRef.current = JSON.stringify(tasks);
      // 最後に保存したファイルと状態も更新
      lastSavedFileRef.current = currentFile;
      lastSavedTasksRef.current = JSON.stringify(tasks);
    }
  }, [tasks, currentFile, saveTasksNow]);

  // 自動保存の設定
  useEffect(() => {
    // 前回のタイマーをクリア
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 自動保存のタイマーを設定
    if (interval > 0) {
      console.log(`自動保存を ${interval}ms 間隔で設定しました`);
      timerRef.current = setInterval(async () => {
        if (currentFile) {
          // タスクの変更があるかチェック
          const tasksChanged = prevTasksRef.current !== JSON.stringify(tasks);

          if (tasksChanged) {
            console.log(`自動保存を実行します: ${currentFile}`);
            await saveTasksNow();
          } else {
            console.log(`変更がないため自動保存をスキップします: ${currentFile}`);
          }
        }
      }, interval);
    }

    // コンポーネントのアンマウント時にタイマーをクリア
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interval, currentFile, tasks, saveTasksNow]);

  return {
    isAutoSaving,
    lastSaved,
    error,
    saveTasksNow,
    clearError,
  };
};
