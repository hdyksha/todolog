import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTaskFiles } from '../hooks/useTaskFiles';
import { useAutoSave } from '../hooks/useAutoSave';
import { Task } from '../types/Task';
import { TaskFile } from '../services/ApiService';

interface AppContextType {
  // タスク関連
  tasks: Task[];
  activeTasks: { [date: string]: Task[] };
  archivedTasks: { [date: string]: Task[] };
  newTask: string;
  loading: boolean;
  // ファイル関連
  taskFiles: TaskFile[];
  currentFile: string;
  newFileName: string;
  fileLoading: boolean;
  // アーカイブ関連
  showArchived: boolean;
  // 自動保存関連
  isAutoSaving: boolean;
  lastSaved: Date | null;
  // エラー関連
  error: string | null;
  // アクション
  setNewTask: (text: string) => void;
  setNewFileName: (name: string) => void;
  setCurrentFile: (name: string) => void;
  setShowArchived: (show: boolean) => void;
  loadTasksFromFile: (filename: string) => Promise<void>;
  addTask: (text: string, dueDate?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  createFile: (filename: string) => Promise<void>;
  deleteFile: (filename: string) => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // タスク管理フック
  const taskHook = useTasks();
  const {
    tasks,
    activeTasks,
    archivedTasks,
    newTask,
    setNewTask,
    loading: tasksLoading,
    error: tasksError,
    loadTasksFromFile: loadTasks,
    addTask: addTaskBase,
    toggleTask,
    deleteTask,
    updateTask,
    resetTasks,
    fetchAvailableFiles,
  } = taskHook;

  // ファイル管理フック
  const fileHook = useTaskFiles();
  const {
    taskFiles,
    fileLoading,
    currentFile,
    newFileName,
    setCurrentFile,
    setNewFileName,
    loadTaskFiles,
    createNewFile,
    deleteFile: deleteFileBase,
  } = fileHook;

  // 初期化時にファイル一覧を読み込む
  useEffect(() => {
    loadTaskFiles();
  }, [loadTaskFiles]);

  // 自動保存フック
  const autoSaveHook = useAutoSave(tasks, currentFile, {
    onSaveSuccess: () => {
      console.log(`タスクを自動保存しました: ${currentFile}`);
    },
    onSaveError: (error: unknown) => {
      console.error(`タスクの自動保存に失敗しました: ${error}`);
    },
  });

  const {
    isAutoSaving,
    lastSaved,
    error: autoSaveError,
    saveTasksNow,
    clearError: clearAutoSaveError,
  } = autoSaveHook;

  // 現在のファイル名を追跡するためのref
  const lastSavedFileRef = useRef<string>('');

  // タスクが変更されたときに即時保存（ただし現在選択中のファイルにのみ保存）
  useEffect(() => {
    if (currentFile && lastSavedFileRef.current === currentFile) {
      // 現在のファイルが最後に保存したファイルと同じ場合のみ保存
      saveTasksNow();
    } else if (currentFile) {
      // ファイルが切り替わった場合は、現在のファイル名を記録するだけ
      lastSavedFileRef.current = currentFile;
      console.log(`AppContext: ファイルを切り替えました: ${currentFile}`);
    }
  }, [tasks, currentFile, saveTasksNow]);

  // アーカイブ表示状態
  const [showArchived, setShowArchived] = useState(true);

  // エラー状態
  const [appError, setAppError] = useState<string | null>(null);

  // タスクをファイルから読み込む
  const loadTasksFromFile = useCallback(
    async (filename: string) => {
      try {
        await loadTasks(filename);
      } catch (err) {
        setAppError(`タスクの読み込みに失敗しました: ${err}`);
      }
    },
    [loadTasks, setAppError]
  );

  // タスクを追加する（期限日付き）
  const addTask = useCallback(
    (text: string, dueDate?: string) => {
      if (!text.trim()) return;
      try {
        // 基本的なタスク追加
        const result = addTaskBase(text);
        // 期限日が指定されていれば、作成されたタスクを更新
        if (result.success && result.data && dueDate) {
          updateTask(result.data.id, { dueDate });
        }
      } catch (err) {
        setAppError(`タスクの追加に失敗しました: ${err}`);
      }
    },
    [addTaskBase, updateTask, setAppError]
  );

  // ファイルを作成する
  const createFile = useCallback(
    async (filename: string) => {
      try {
        await createNewFile();
        await loadTaskFiles();
      } catch (err) {
        setAppError(`ファイルの作成に失敗しました: ${err}`);
      }
    },
    [createNewFile, loadTaskFiles, setAppError]
  );

  // ファイルを削除する
  const deleteFile = useCallback(
    async (filename: string) => {
      try {
        await deleteFileBase(filename);
        await loadTaskFiles();
        // 現在のファイルが削除された場合はリセット
        if (currentFile === filename) {
          resetTasks();
          setCurrentFile('');
        }
      } catch (err) {
        setAppError(`ファイルの削除に失敗しました: ${err}`);
      }
    },
    [deleteFileBase, loadTaskFiles, currentFile, resetTasks, setCurrentFile, setAppError]
  );

  // エラーをクリア
  const clearError = useCallback(() => {
    setAppError(null);
    clearAutoSaveError();
  }, [clearAutoSaveError]);

  // コンテキスト値
  const value: AppContextType = {
    tasks,
    activeTasks,
    archivedTasks,
    newTask,
    loading: tasksLoading || fileLoading,
    taskFiles,
    currentFile: currentFile || '',
    newFileName,
    fileLoading,
    showArchived,
    isAutoSaving,
    lastSaved,
    error: appError || tasksError || autoSaveError,
    setNewTask,
    setNewFileName,
    setCurrentFile,
    setShowArchived,
    loadTasksFromFile,
    addTask,
    toggleTask: (id: string) => {
      console.log(`AppContext: タスク ${id} の完了状態を切り替えます`);
      return toggleTask(id);
    },
    deleteTask,
    updateTask,
    createFile,
    deleteFile,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
