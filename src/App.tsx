import React, { useState, useEffect } from 'react';
import './App.css';

// カスタムフックのインポート
import { useTaskFiles } from './hooks/useTaskFiles';
import { useTasks } from './hooks/useTasks';
import { useAutoSave } from './hooks/useAutoSave';

// コンポーネントのインポート
import FileManager from './components/FileManager/FileManager';
import TaskForm from './components/TaskForm/TaskForm';
import TaskList from './components/TaskList/TaskList';
import ArchiveSection from './components/ArchiveSection/ArchiveSection';

function App() {
  // カスタムフックの使用
  const {
    taskFiles,
    currentFile,
    newFileName,
    fileLoading,
    error: fileError,
    setNewFileName,
    loadTaskFiles,
    createNewFile,
    deleteFile,
  } = useTaskFiles();

  const {
    tasks,
    activeTasks,
    archivedTasks,
    newTask,
    loading,
    error: taskError,
    setNewTask,
    loadTasksFromFile,
    addTask,
    toggleTask,
    deleteTask,
    resetTasks,
  } = useTasks();

  const {
    isAutoSaving,
    lastSaved,
    error: autoSaveError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    saveTasksNow,
  } = useAutoSave(tasks, currentFile, {
    // eslint-disable-next-line no-console
    onSaveSuccess: () => console.log(`タスクを自動保存しました: ${currentFile}`),
    onSaveError: err => console.error(`タスクの自動保存エラー: ${err}`),
  });

  // アーカイブの表示/非表示状態
  const [showArchived, setShowArchived] = useState(true);

  // エラーメッセージの統合
  const error = fileError || taskError || autoSaveError;

  // アプリケーション起動時にファイル一覧を読み込む
  useEffect(() => {
    const initializeApp = async () => {
      const selectedFile = await loadTaskFiles();
      if (selectedFile) {
        await loadTasksFromFile(selectedFile);
      }
    };

    initializeApp();
  }, [loadTaskFiles, loadTasksFromFile]);

  // ファイル選択時の処理
  const handleFileSelect = async (filename: string) => {
    await loadTasksFromFile(filename);
  };

  // ファイル削除時の処理
  const handleDeleteFile = async (filename: string) => {
    const result = await deleteFile(filename);
    if (result.success && result.nextFile) {
      await loadTasksFromFile(result.nextFile);
    } else if (result.success && !result.nextFile) {
      resetTasks();
    }
  };

  // 新しいファイル作成時の処理
  const handleCreateFile = async () => {
    const newFile = await createNewFile();
    if (newFile) {
      resetTasks();
    }
  };

  // アーカイブの表示/非表示を切り替え
  const toggleArchiveVisibility = () => {
    setShowArchived(!showArchived);
  };

  // 自動保存ステータス（オプション）
  const renderAutoSaveStatus = () => {
    if (isAutoSaving) {
      return <div className="auto-save-status">保存中...</div>;
    }
    if (lastSaved) {
      return (
        <div className="last-saved-status">
          最終保存: {new Date(lastSaved).toLocaleTimeString()}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="App">
      <h1>TODOログ</h1>

      {error && <div className="error-message">{error}</div>}

      <FileManager
        currentFile={currentFile}
        taskFiles={taskFiles}
        newFileName={newFileName}
        fileLoading={fileLoading}
        onFileSelect={handleFileSelect}
        onDeleteFile={handleDeleteFile}
        onNewFileNameChange={setNewFileName}
        onCreateFile={handleCreateFile}
      />

      <TaskForm
        newTask={newTask}
        currentFile={currentFile}
        onNewTaskChange={setNewTask}
        onAddTask={() => addTask(newTask)}
      />

      {/* アクティブなタスク */}
      {!currentFile ? (
        <p className="no-file">ファイルを選択または作成してください</p>
      ) : (
        <TaskList
          tasksByDate={activeTasks}
          isLoading={loading}
          emptyMessage="アクティブなタスクはありません"
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />
      )}

      {/* アーカイブセクション */}
      <ArchiveSection
        archivedTasks={archivedTasks}
        showArchived={showArchived}
        isLoading={loading}
        onToggleVisibility={toggleArchiveVisibility}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />

      {renderAutoSaveStatus()}
    </div>
  );
}

export default App;
