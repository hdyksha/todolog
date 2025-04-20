import React, { useState } from 'react';
import { useServerSettings } from '../../contexts/ServerSettingsContext';
import { useTaskFiles } from '../../hooks/useTaskFiles';
import { apiClient } from '../../services/apiClient';
import './StorageSettings.css';

const StorageSettings: React.FC = () => {
  const { serverSettings, setDataDirectory, isLoading: isSettingsLoading } = useServerSettings();
  const { 
    taskFiles, 
    recentFiles, 
    createNewTaskFile, 
    switchTaskFile, 
    isLoading: isFilesLoading 
  } = useTaskFiles();
  
  const [newDataDir, setNewDataDir] = useState(serverSettings.storage.dataDir);
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // データディレクトリを変更する
  const handleDataDirChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      await setDataDirectory(newDataDir);
      setSuccess('データディレクトリを変更しました');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データディレクトリの変更に失敗しました');
    }
  };

  // 新しいタスクファイルを作成する
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!newFileName.trim()) {
      setError('ファイル名を入力してください');
      return;
    }
    
    try {
      await createNewTaskFile(newFileName);
      setSuccess(`タスクファイル ${newFileName} を作成しました`);
      setNewFileName('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの作成に失敗しました');
    }
  };

  // タスクファイルを切り替える
  const handleSwitchFile = async (filename: string) => {
    setError(null);
    setSuccess(null);
    
    try {
      await switchTaskFile(filename);
      
      // キャッシュをクリアしてタスクを再読み込み
      apiClient.clearCache();
      
      setSuccess(`タスクファイルを ${filename} に切り替えました`);
      setTimeout(() => setSuccess(null), 3000);
      
      // 1秒後にページをリロード
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクファイルの切り替えに失敗しました');
    }
  };

  const isLoading = isSettingsLoading || isFilesLoading;

  return (
    <div className="storage-settings">
      <h2 className="storage-settings__title">ストレージ設定</h2>
      
      {/* データディレクトリ設定 */}
      <section className="storage-section">
        <h3 className="storage-section__title">データ保存先</h3>
        <form onSubmit={handleDataDirChange} className="storage-form">
          <div className="form-group">
            <label htmlFor="dataDir" className="form-label">データディレクトリ</label>
            <input
              id="dataDir"
              type="text"
              className="form-input"
              value={newDataDir}
              onChange={(e) => setNewDataDir(e.target.value)}
              placeholder="例: ./data"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="button button--primary"
            disabled={isLoading || newDataDir === serverSettings.storage.dataDir}
          >
            {isLoading ? '処理中...' : '保存先を変更'}
          </button>
        </form>
        <p className="storage-info">
          現在の保存先: <code>{serverSettings.storage.dataDir}</code>
        </p>
      </section>
      
      {/* 現在のタスクファイル */}
      <section className="storage-section">
        <h3 className="storage-section__title">現在のタスクファイル</h3>
        <div className="current-file">
          <p className="current-file__name">
            <strong>{serverSettings.storage.currentTaskFile}</strong>
          </p>
        </div>
      </section>
      
      {/* タスクファイル作成 */}
      <section className="storage-section">
        <h3 className="storage-section__title">新しいタスクファイルの作成</h3>
        <form onSubmit={handleCreateFile} className="storage-form">
          <div className="form-group">
            <label htmlFor="newFileName" className="form-label">ファイル名</label>
            <input
              id="newFileName"
              type="text"
              className="form-input"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="例: work-tasks"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="button button--primary"
            disabled={isLoading || !newFileName.trim()}
          >
            {isLoading ? '処理中...' : 'ファイルを作成'}
          </button>
        </form>
        <p className="storage-info">
          拡張子 .json は自動的に追加されます
        </p>
      </section>
      
      {/* タスクファイル一覧 */}
      <section className="storage-section">
        <h3 className="storage-section__title">利用可能なタスクファイル</h3>
        {isLoading ? (
          <p>読み込み中...</p>
        ) : taskFiles.length > 0 ? (
          <ul className="file-list">
            {taskFiles.map((file) => (
              <li key={file} className="file-list__item">
                <span className={`file-name ${file === serverSettings.storage.currentTaskFile ? 'file-name--current' : ''}`}>
                  {file}
                </span>
                {file !== serverSettings.storage.currentTaskFile && (
                  <button
                    className="button button--small"
                    onClick={() => handleSwitchFile(file)}
                    disabled={isLoading}
                  >
                    切り替え
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>タスクファイルがありません</p>
        )}
      </section>
      
      {/* 最近使用したファイル */}
      {recentFiles.length > 0 && (
        <section className="storage-section">
          <h3 className="storage-section__title">最近使用したファイル</h3>
          <ul className="file-list">
            {recentFiles.map((file) => (
              <li key={file} className="file-list__item">
                <span className={`file-name ${file === serverSettings.storage.currentTaskFile ? 'file-name--current' : ''}`}>
                  {file}
                </span>
                {file !== serverSettings.storage.currentTaskFile && (
                  <button
                    className="button button--small"
                    onClick={() => handleSwitchFile(file)}
                    disabled={isLoading}
                  >
                    切り替え
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {/* エラーメッセージ */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* 成功メッセージ */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
    </div>
  );
};

export default StorageSettings;
