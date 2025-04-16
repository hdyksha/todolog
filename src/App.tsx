import React, { useState, useEffect } from 'react';
import './App.css';
import { Task } from './types/Task';
import { apiService, TaskFile } from './services/ApiService';

// コンポーネントのインポート
import FileManager from './components/FileManager/FileManager';
import TaskForm from './components/TaskForm/TaskForm';
import TaskList from './components/TaskList/TaskList';
import ArchiveSection from './components/ArchiveSection/ArchiveSection';

// 日付ごとにグループ化されたタスクの型
interface TasksByDate {
  [date: string]: Task[];
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTasks, setActiveTasks] = useState<TasksByDate>({});
  const [archivedTasks, setArchivedTasks] = useState<TasksByDate>({});
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveTimer, setSaveTimer] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(true);
  
  // ファイル関連の状態
  const [taskFiles, setTaskFiles] = useState<TaskFile[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [newFileName, setNewFileName] = useState('');
  const [fileLoading, setFileLoading] = useState(false);

  // タスクを日付ごとにグループ化し、アクティブとアーカイブに分ける
  const groupAndSeparateTasks = (tasks: Task[]) => {
    const active: TasksByDate = {};
    const archived: TasksByDate = {};
    
    // タスクを日付でソート（新しい順）
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    sortedTasks.forEach(task => {
      // 日付部分のみを抽出（YYYY-MM-DD）
      const date = new Date(task.createdAt).toISOString().split('T')[0];
      
      // 完了済みタスクとそれ以外で分ける
      const targetGroup = task.completed ? archived : active;
      
      if (!targetGroup[date]) {
        targetGroup[date] = [];
      }
      
      targetGroup[date].push(task);
    });
    
    return { active, archived };
  };

  // ファイル一覧を読み込む
  const loadTaskFiles = async () => {
    try {
      setFileLoading(true);
      const files = await apiService.getTaskFiles();
      setTaskFiles(files);
      
      // 初回読み込み時に最初のファイルを選択
      if (files.length > 0 && !currentFile) {
        setCurrentFile(files[0].name);
        await loadTasksFromFile(files[0].name);
      }
    } catch (err) {
      setError('ファイル一覧の読み込みに失敗しました');
      console.error('ファイル一覧の読み込みエラー:', err);
    } finally {
      setFileLoading(false);
    }
  };

  // 特定のファイルからタスクを読み込む
  const loadTasksFromFile = async (filename: string) => {
    if (!filename) return;
    
    try {
      setLoading(true);
      const loadedTasks = await apiService.getTasks(filename);
      setTasks(loadedTasks);
      
      // タスクをアクティブとアーカイブに分ける
      const { active, archived } = groupAndSeparateTasks(loadedTasks);
      setActiveTasks(active);
      setArchivedTasks(archived);
      
      setCurrentFile(filename);
      setError(null);
    } catch (err) {
      setError(`タスクの読み込みに失敗しました: ${filename}`);
      console.error(`タスクの読み込みエラー (${filename}):`, err);
    } finally {
      setLoading(false);
    }
  };

  // 新しいファイルを作成
  const createNewFile = async () => {
    if (!newFileName.trim()) {
      setError('ファイル名を入力してください');
      return;
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
      setTasks([]);
      setActiveTasks({});
      setArchivedTasks({});
    } catch (err: any) {
      setError(err.message || 'ファイルの作成に失敗しました');
    } finally {
      setFileLoading(false);
    }
  };

  // ファイルを削除
  const deleteFile = async (filename: string) => {
    if (!filename) return;
    
    if (!window.confirm(`ファイル "${filename}" を削除してもよろしいですか？`)) {
      return;
    }
    
    try {
      setFileLoading(true);
      await apiService.deleteTaskFile(filename);
      
      // 現在のファイルが削除された場合は別のファイルを選択
      if (currentFile === filename) {
        const remainingFiles = taskFiles.filter(file => file.name !== filename);
        if (remainingFiles.length > 0) {
          setCurrentFile(remainingFiles[0].name);
          await loadTasksFromFile(remainingFiles[0].name);
        } else {
          setCurrentFile('');
          setTasks([]);
          setActiveTasks({});
          setArchivedTasks({});
        }
      }
      
      await loadTaskFiles();
    } catch (err) {
      setError('ファイルの削除に失敗しました');
    } finally {
      setFileLoading(false);
    }
  };

  // アプリケーション起動時にファイル一覧を読み込む
  useEffect(() => {
    loadTaskFiles();
    
    // 自動保存の設定
    const setupAutoSave = async () => {
      try {
        const config = await apiService.getConfig();
        
        if (saveTimer) {
          window.clearInterval(saveTimer);
        }
        
        const timerId = window.setInterval(async () => {
          if (tasks.length > 0 && currentFile) {
            await apiService.saveTasks(currentFile, tasks);
            console.log(`タスクを自動保存しました: ${currentFile}`);
          }
        }, config.autoSaveInterval);
        
        setSaveTimer(timerId);
      } catch (err) {
        console.error('自動保存の設定に失敗しました:', err);
      }
    };

    setupAutoSave();

    // コンポーネントのアンマウント時に自動保存を停止
    return () => {
      if (saveTimer) {
        window.clearInterval(saveTimer);
      }
    };
  }, []);

  // タスクが変更されたときに保存
  useEffect(() => {
    const saveTasks = async () => {
      if (tasks.length > 0 && !loading && currentFile) {
        try {
          await apiService.saveTasks(currentFile, tasks);
          console.log(`タスクを保存しました: ${currentFile}`);
        } catch (err) {
          console.error(`タスクの保存エラー (${currentFile}):`, err);
        }
      }
    };

    saveTasks();
  }, [tasks, loading, currentFile]);

  // タスクが変更されたときにグループ化を更新
  useEffect(() => {
    const { active, archived } = groupAndSeparateTasks(tasks);
    setActiveTasks(active);
    setArchivedTasks(archived);
  }, [tasks]);

  // 新しいタスクを追加
  const addTask = () => {
    if (!currentFile) {
      setError('先にファイルを選択または作成してください');
      return;
    }
    
    if (newTask.trim() !== '') {
      const newTaskItem: Task = {
        id: Date.now().toString(),
        text: newTask,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, newTaskItem]);
      setNewTask('');
    }
  };

  // タスクの完了状態を切り替え
  const toggleTask = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // タスクを削除
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // アーカイブの表示/非表示を切り替え
  const toggleArchiveVisibility = () => {
    setShowArchived(!showArchived);
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
        onFileSelect={loadTasksFromFile}
        onDeleteFile={deleteFile}
        onNewFileNameChange={setNewFileName}
        onCreateFile={createNewFile}
      />
      
      <TaskForm
        newTask={newTask}
        currentFile={currentFile}
        onNewTaskChange={setNewTask}
        onAddTask={addTask}
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
    </div>
  );
}

export default App;
