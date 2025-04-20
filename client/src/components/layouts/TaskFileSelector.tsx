import React, { useState } from 'react';
import { useServerSettings } from '../../contexts/ServerSettingsContext';
import { useTaskFiles } from '../../hooks/useTaskFiles';
import { apiClient } from '../../services/apiClient';
import './TaskFileSelector.css';

const TaskFileSelector: React.FC = () => {
  const { serverSettings } = useServerSettings();
  const { recentFiles, switchTaskFile, isLoading } = useTaskFiles();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // キャッシュをクリアしてタスクを再読み込み
      apiClient.clearCache();
      
      // ページをリロード
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの切り替えに失敗しました');
    }
  };

  // ドロップダウンの表示/非表示を切り替える
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

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
        <div className="task-file-selector__dropdown">
          <div className="task-file-selector__header">
            タスクファイルを選択
          </div>
          
          {recentFiles.length > 0 ? (
            <ul className="task-file-selector__list">
              {recentFiles.map((file) => (
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
              最近使用したファイルがありません
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
