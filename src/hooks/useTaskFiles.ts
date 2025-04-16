import { useState, useCallback } from 'react';
import { apiService, TaskFile } from '../services/ApiService';
import { useErrorContext } from '../contexts/ErrorContext';

// ファイル削除の結果型
interface DeleteFileResult {
  success: boolean;
  nextFile: string | null;
}

/**
 * タスクファイル操作のためのカスタムフック
 */
export function useTaskFiles() {
  const [taskFiles, setTaskFiles] = useState<TaskFile[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [newFileName, setNewFileName] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const { handleError } = useErrorContext();

  /**
   * ファイル一覧を読み込む
   */
  const loadTaskFiles = useCallback(async () => {
    try {
      setFileLoading(true);
      const files = await apiService.getTaskFiles();
      setTaskFiles(files);

      // 初回読み込み時に最初のファイルを選択
      if (files.length > 0 && !currentFile) {
        setCurrentFile(files[0].name);
        return files[0].name; // 選択されたファイル名を返す
      }
      return null;
    } catch (err) {
      handleError(err, async () => {
        await loadTaskFiles();
      });
      return null;
    } finally {
      setFileLoading(false);
    }
  }, [currentFile, handleError]);

  /**
   * 新しいファイルを作成
   */
  const createNewFile = useCallback(async () => {
    if (!newFileName.trim()) {
      handleError(new Error('ファイル名を入力してください'));
      return null;
    }

    // .json 拡張子を自動追加
    let filename = newFileName.trim();
    if (!filename.endsWith('.json')) {
      filename += '.json';
    }

    try {
      setFileLoading(true);
      await apiService.createTaskFile(filename);
      setNewFileName('');
      await loadTaskFiles();
      setCurrentFile(filename);
      return filename;
    } catch (err) {
      handleError(err, async () => {
        await createNewFile();
      });
      return null;
    } finally {
      setFileLoading(false);
    }
  }, [newFileName, loadTaskFiles, handleError]);

  /**
   * ファイルを削除
   */
  const deleteFile = useCallback(
    async (filename: string): Promise<DeleteFileResult> => {
      if (!filename) return { success: false, nextFile: null };

      if (!window.confirm(`ファイル "${filename}" を削除してもよろしいですか？`)) {
        return { success: false, nextFile: null };
      }

      try {
        setFileLoading(true);
        await apiService.deleteTaskFile(filename);

        // 現在のファイルが削除された場合は別のファイルを選択
        if (currentFile === filename) {
          const remainingFiles = taskFiles.filter(file => file.name !== filename);
          if (remainingFiles.length > 0) {
            setCurrentFile(remainingFiles[0].name);
            return { success: true, nextFile: remainingFiles[0].name };
          } else {
            setCurrentFile('');
            return { success: true, nextFile: null };
          }
        }

        await loadTaskFiles();
        return { success: true, nextFile: null };
      } catch (err) {
        handleError(err, async () => {
          await deleteFile(filename);
        });
        return { success: false, nextFile: null };
      } finally {
        setFileLoading(false);
      }
    },
    [currentFile, taskFiles, loadTaskFiles, handleError]
  );

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    // エラーコンテキストを使用するため不要
  }, []);

  return {
    taskFiles,
    currentFile,
    newFileName,
    fileLoading,
    error: null, // エラーコンテキストを使用するため不要
    setCurrentFile,
    setNewFileName,
    loadTaskFiles,
    createNewFile,
    deleteFile,
    clearError,
  };
}
