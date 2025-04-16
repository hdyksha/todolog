import React, { useEffect } from 'react';
import './App.css';
import FileManager from './components/FileManager/FileManager';
import TaskForm from './components/TaskForm/TaskForm';
import TaskList from './components/TaskList/TaskList';
import ArchiveSection from './components/ArchiveSection/ArchiveSection';
import { useAppContext } from './contexts/AppContext';

const App: React.FC = () => {
  const {
    activeTasks,
    archivedTasks,
    newTask,
    loading,
    taskFiles,
    currentFile,
    newFileName,
    fileLoading,
    showArchived,
    isAutoSaving,
    lastSaved,
    error,
    setNewTask,
    setNewFileName,
    setCurrentFile,
    setShowArchived,
    loadTasksFromFile,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    createFile,
    deleteFile,
    clearError,
  } = useAppContext();

  // ファイル一覧を読み込む
  useEffect(() => {
    if (taskFiles.length > 0 && !currentFile) {
      // デフォルトで最初のファイルを選択
      setCurrentFile(taskFiles[0].name);
    }
  }, [taskFiles, currentFile, setCurrentFile]);

  // ファイルが選択されたらタスクを読み込む
  useEffect(() => {
    if (currentFile) {
      loadTasksFromFile(currentFile);
    }
  }, [currentFile, loadTasksFromFile]);

  // タスク追加ハンドラー
  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask);
    }
  };

  // アーカイブ表示切り替えハンドラー
  const toggleArchiveVisibility = () => {
    setShowArchived(!showArchived);
  };

  return (
    <div className="App">
      <h1>TODOログ</h1>

      {error && (
        <div className="error-message" onClick={clearError}>
          {error}
          <span className="close-error">×</span>
        </div>
      )}

      <FileManager
        currentFile={currentFile}
        taskFiles={taskFiles}
        newFileName={newFileName}
        fileLoading={fileLoading}
        onFileSelect={setCurrentFile}
        onDeleteFile={deleteFile}
        onNewFileNameChange={setNewFileName}
        onCreateFile={() => createFile(newFileName)}
      />

      <TaskForm
        newTask={newTask}
        currentFile={currentFile}
        onNewTaskChange={setNewTask}
        onAddTask={handleAddTask}
      />

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : !currentFile ? (
        <div className="no-file">ファイルを選択してください</div>
      ) : Object.keys(activeTasks).length === 0 && Object.keys(archivedTasks).length === 0 ? (
        <div className="no-tasks">タスクがありません</div>
      ) : (
        <>
          <TaskList
            tasksByDate={activeTasks}
            isLoading={loading}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
          />

          <ArchiveSection
            archivedTasks={archivedTasks}
            showArchived={showArchived}
            isLoading={loading}
            onToggleVisibility={toggleArchiveVisibility}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
          />
        </>
      )}

      {isAutoSaving && <div className="auto-save-status">保存中...</div>}
      {!isAutoSaving && lastSaved && (
        <div className="last-saved-status">最終保存: {lastSaved.toLocaleTimeString()}</div>
      )}
    </div>
  );
};

export default App;
