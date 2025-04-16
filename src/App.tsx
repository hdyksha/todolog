import React from 'react';
import './App.css';

// コンテキストのインポート
import { AppProvider, AppInitializer, useArchiveContext } from './contexts/AppContext';
import { useFileContext } from './contexts/FileContext';
import { useTaskContext } from './contexts/TaskContext';
import { useAutoSaveContext } from './contexts/AutoSaveContext';

// コンポーネントのインポート
import FileManager from './components/FileManager/FileManager';
import TaskForm from './components/TaskForm/TaskForm';
import TaskList from './components/TaskList/TaskList';
import ArchiveSection from './components/ArchiveSection/ArchiveSection';

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  // コンテキストからデータと関数を取得
  const {
    taskFiles,
    currentFile,
    newFileName,
    fileLoading,
    error: fileError,
    setCurrentFile,
    setNewFileName,
    createNewFile,
    deleteFile,
  } = useFileContext();

  const {
    newTask,
    activeTasks,
    archivedTasks,
    loading,
    error: taskError,
    setNewTask,
    loadTasksFromFile,
    addTask,
    toggleTask,
    deleteTask,
    resetTasks,
  } = useTaskContext();

  const { isAutoSaving, lastSaved, error: autoSaveError } = useAutoSaveContext();

  const { showArchived, toggleArchiveVisibility } = useArchiveContext();

  // エラーメッセージの統合
  const error = fileError || taskError || autoSaveError;

  // ファイル選択時の処理
  const handleFileSelect = async (filename: string) => {
    setCurrentFile(filename);
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

  // 自動保存ステータス表示
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
};

// アプリケーションのルートコンポーネント
function App() {
  return (
    <AppProvider>
      <AppInitializer>
        <AppContent />
      </AppInitializer>
    </AppProvider>
  );
}

export default App;
