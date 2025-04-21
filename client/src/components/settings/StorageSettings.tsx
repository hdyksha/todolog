import React, { useState } from 'react';
import { useServerSettings } from '../../contexts/ServerSettingsContext';
import { useTaskFiles } from '../../contexts/TaskFilesContext';
import { useNotification } from '../../contexts/NotificationContext';
import './StorageSettings.css';

const StorageSettings: React.FC = () => {
  const { serverSettings, setDataDirectory } = useServerSettings();
  const { createNewTaskFile, refreshFiles } = useTaskFiles();
  const { showNotification } = useNotification();
  
  const [dataDir, setDataDir] = useState(serverSettings.storage.dataDir);
  const [newFileName, setNewFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // データディレクトリを変更する
  const handleDataDirChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dataDir === serverSettings.storage.dataDir) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await setDataDirectory(dataDir);
      showNotification('データディレクトリを変更しました', 'success');
      
      // ファイル一覧を更新
      await refreshFiles();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'データディレクトリの変更に失敗しました',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 新しいタスクファイルを作成する
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFileName) {
      showNotification('ファイル名を入力してください', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createNewTaskFile(newFileName);
      showNotification(`タスクファイル ${newFileName} を作成しました`, 'success');
      setNewFileName('');
      
      // ファイル一覧を更新
      await refreshFiles();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'タスクファイルの作成に失敗しました',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="storage-settings">
      <h2>ストレージ設定</h2>
      
      <div className="storage-settings__section">
        <h3>データディレクトリ</h3>
        <p className="storage-settings__description">
          タスクデータを保存するディレクトリを指定します。
        </p>
        
        <form onSubmit={handleDataDirChange} className="storage-settings__form">
          <div className="storage-settings__form-group">
            <label htmlFor="dataDir">データディレクトリのパス:</label>
            <input
              type="text"
              id="dataDir"
              value={dataDir}
              onChange={(e) => setDataDir(e.target.value)}
              className="storage-settings__input"
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            className="storage-settings__button"
            disabled={isSubmitting || dataDir === serverSettings.storage.dataDir}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
      
      <div className="storage-settings__section">
        <h3>新しいタスクファイル</h3>
        <p className="storage-settings__description">
          新しいタスクファイルを作成します。拡張子は自動的に .json が付与されます。
        </p>
        
        <form onSubmit={handleCreateFile} className="storage-settings__form">
          <div className="storage-settings__form-group">
            <label htmlFor="newFileName">ファイル名:</label>
            <input
              type="text"
              id="newFileName"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="storage-settings__input"
              placeholder="例: work-tasks"
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            className="storage-settings__button"
            disabled={isSubmitting || !newFileName}
          >
            {isSubmitting ? '作成中...' : '作成'}
          </button>
        </form>
      </div>
      
      <div className="storage-settings__section">
        <h3>現在のタスクファイル</h3>
        <p className="storage-settings__current-file">
          {serverSettings.storage.currentTaskFile}
        </p>
        <p className="storage-settings__description">
          タスクファイルを切り替えるには、画面上部のドロップダウンメニューを使用してください。
        </p>
      </div>
    </div>
  );
};

export default StorageSettings;
