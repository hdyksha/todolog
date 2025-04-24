import React, { useState, useCallback } from 'react';
import { useServerSettings } from '../../contexts/ServerSettingsContext';
import { useTaskFiles } from '../../contexts/TaskFilesContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import './TaskFileSelector.css';

const TaskFileSelector: React.FC = () => {
  const { serverSettings } = useServerSettings();
  const { taskFiles, recentFiles, switchTaskFile, isLoading, refreshFiles } = useTaskFiles();
  const { currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const currentFile = serverSettings.storage.currentTaskFile;

  // タスクファイルを切り替える
  const handleSwitchFile = async (filename: string) => {
    if (filename === currentFile) {
      setIsOpen(false);
      return;
    }

    setError(null);
    try {
      await switchTaskFile(filename);
      setIsOpen(false);
      
      // ページをリロード
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの切り替えに失敗しました');
    }
  };

  // ドロップダウンの表示/非表示を切り替える
  const toggleDropdown = useCallback(() => {
    if (!isOpen) {
      // ドロップダウンを開くときにファイル一覧を更新
      refreshFiles();
    }
    setIsOpen(!isOpen);
  }, [isOpen, refreshFiles]);

  // 表示モードを切り替える
  const toggleViewMode = () => {
    setShowAllFiles(!showAllFiles);
  };

  // 表示するファイルリスト
  const filesToShow = showAllFiles ? taskFiles : recentFiles;

  return (
    <div className="task-file-selector">
      <button
        className="task-file-selector__current"
        onClick={toggleDropdown}
        disabled={isLoading}
      >
        <span className="task-file-selector__filename">{currentFile}</span>
        <span className={`task-file-selector__arrow ${isOpen ? 'task-file-selector__arrow--open' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div 
          className="task-file-selector__dropdown"
          style={{
            backgroundColor: `rgba(var(--color-background-rgb), 0.95)`
          }}
        >
          <div className="task-file-selector__header">
            タスクファイルを選択
            <button 
              className="task-file-selector__view-toggle"
              onClick={toggleViewMode}
            >
              {showAllFiles ? '最近使用したファイル' : 'すべてのファイル'}
            </button>
          </div>
          
          {filesToShow.length > 0 ? (
            <ul className="task-file-selector__list">
              {filesToShow.map((file) => (
                <li
                  key={file}
                  className={`task-file-selector__item ${file === currentFile ? 'task-file-selector__item--active' : ''}`}
                  onClick={() => handleSwitchFile(file)}
                >
                  {file}
                </li>
              ))}
            </ul>
          ) : (
            <div className="task-file-selector__empty">
              {showAllFiles ? 'タスクファイルがありません' : '最近使用したファイルがありません'}
            </div>
          )}
          
          {error && (
            <div className="task-file-selector__error">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFileSelector;
