import React, { useState, useEffect } from 'react';
import './App.css';
import { Task } from './types/Task';
import { apiService, TaskFile } from './services/ApiService';

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

  // 日付フォーマット（ファイル選択用）
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // 日付フォーマット（タスクグループ用）
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 日付を YYYY-MM-DD 形式に変換
    const dateToday = today.toISOString().split('T')[0];
    const dateYesterday = yesterday.toISOString().split('T')[0];
    const dateTask = dateString;
    
    if (dateTask === dateToday) {
      return '今日';
    } else if (dateTask === dateYesterday) {
      return '昨日';
    } else {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    }
  };

  // アーカイブの表示/非表示を切り替え
  const toggleArchiveVisibility = () => {
    setShowArchived(!showArchived);
  };

  // アーカイブのタスク数を計算
  const countArchivedTasks = () => {
    return Object.values(archivedTasks).reduce((count, tasks) => count + tasks.length, 0);
  };

  return (
    <div className="App">
      <h1>TODOログ</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="file-manager">
        <h2>タスクファイル</h2>
        
        <div className="file-selector">
          <select 
            value={currentFile} 
            onChange={(e) => loadTasksFromFile(e.target.value)}
            disabled={fileLoading || taskFiles.length === 0}
          >
            {taskFiles.length === 0 ? (
              <option value="">ファイルがありません</option>
            ) : (
              taskFiles.map(file => (
                <option key={file.name} value={file.name}>
                  {file.name} ({formatDateTime(file.lastModified)})
                </option>
              ))
            )}
          </select>
          
          {currentFile && (
            <button 
              onClick={() => deleteFile(currentFile)}
              disabled={fileLoading}
              className="delete-file-btn"
            >
              削除
            </button>
          )}
        </div>
        
        <div className="new-file-form">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="新しいファイル名..."
            disabled={fileLoading}
          />
          <button 
            onClick={createNewFile}
            disabled={fileLoading || !newFileName.trim()}
          >
            作成
          </button>
        </div>
      </div>
      
      <div className="task-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="新しいタスクを入力..."
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          disabled={!currentFile}
        />
        <button 
          onClick={addTask}
          disabled={!currentFile}
        >
          追加
        </button>
      </div>
      
      {/* アクティブなタスク */}
      <div className="task-list active-tasks">
        {!currentFile ? (
          <p className="no-file">ファイルを選択または作成してください</p>
        ) : loading ? (
          <p className="loading">読み込み中...</p>
        ) : Object.keys(activeTasks).length === 0 ? (
          <p className="no-tasks">アクティブなタスクはありません</p>
        ) : (
          Object.keys(activeTasks).map(date => (
            <div key={date} className="task-group">
              <h3 className="date-header">{formatDate(date)}</h3>
              {activeTasks[date].map(task => (
                <div key={task.id} className="task-item">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className="task-text">{task.text}</span>
                  <span className="task-time">
                    {new Date(task.createdAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button onClick={() => deleteTask(task.id)} className="delete-btn">
                    削除
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      {/* アーカイブセクション */}
      {countArchivedTasks() > 0 && (
        <div className="archive-section">
          <div className="archive-header" onClick={toggleArchiveVisibility}>
            <h2>アーカイブ済みタスク ({countArchivedTasks()})</h2>
            <span className={`toggle-icon ${showArchived ? 'open' : 'closed'}`}>
              {showArchived ? '▼' : '▶'}
            </span>
          </div>
          
          {showArchived && (
            <div className="task-list archived-tasks">
              {Object.keys(archivedTasks).map(date => (
                <div key={date} className="task-group archived">
                  <h3 className="date-header archived">{formatDate(date)}</h3>
                  {archivedTasks[date].map(task => (
                    <div key={task.id} className="task-item archived">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span className="task-text">{task.text}</span>
                      <span className="task-time">
                        {new Date(task.createdAt).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button onClick={() => deleteTask(task.id)} className="delete-btn">
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
