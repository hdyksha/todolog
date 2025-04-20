import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import ArchiveSettings from '../components/archive/ArchiveSettings';
import './SettingsPage.css';

interface UserSettings {
  defaultView: 'list' | 'board';
  defaultSort: 'dueDate' | 'priority' | 'createdAt';
  defaultFilter: 'all' | 'active' | 'completed';
  itemsPerPage: number;
}

const defaultSettings: UserSettings = {
  defaultView: 'list',
  defaultSort: 'dueDate',
  defaultFilter: 'all',
  itemsPerPage: 10,
};

const SETTINGS_STORAGE_KEY = 'todolog-user-settings';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { resetSettings: resetAppSettings } = useSettings();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSaved, setIsSaved] = useState(false);

  // 保存された設定を読み込む
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
      }
    }
  }, []);

  // 設定を保存する
  const saveSettings = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // 設定をリセットする
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    resetAppSettings(); // アプリ全体の設定もリセット
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // 設定値の変更を処理する
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'itemsPerPage' ? Number(value) : value,
    }));
  };

  return (
    <div className="settings-page">
      <h1 className="settings-page__title">設定</h1>
      
      <section className="settings-section">
        <h2 className="settings-section__title">表示設定</h2>
        
        <div className="settings-group">
          <label htmlFor="theme" className="settings-label">テーマ</label>
          <ThemeToggle />
        </div>
        
        <div className="settings-group">
          <label htmlFor="defaultView" className="settings-label">デフォルト表示</label>
          <select
            id="defaultView"
            name="defaultView"
            className="settings-select"
            value={settings.defaultView}
            onChange={handleChange}
          >
            <option value="list">リスト表示</option>
            <option value="board">ボード表示</option>
          </select>
        </div>
        
        <div className="settings-group">
          <label htmlFor="itemsPerPage" className="settings-label">1ページあたりの表示件数</label>
          <input
            id="itemsPerPage"
            name="itemsPerPage"
            type="number"
            min="5"
            max="50"
            step="5"
            className="settings-input"
            value={settings.itemsPerPage}
            onChange={handleChange}
          />
        </div>
      </section>
      
      <section className="settings-section">
        <h2 className="settings-section__title">タスク設定</h2>
        
        <div className="settings-group">
          <label htmlFor="defaultSort" className="settings-label">デフォルトの並び順</label>
          <select
            id="defaultSort"
            name="defaultSort"
            className="settings-select"
            value={settings.defaultSort}
            onChange={handleChange}
          >
            <option value="dueDate">期限日</option>
            <option value="priority">優先度</option>
            <option value="createdAt">作成日</option>
          </select>
        </div>
        
        <div className="settings-group">
          <label htmlFor="defaultFilter" className="settings-label">デフォルトのフィルター</label>
          <select
            id="defaultFilter"
            name="defaultFilter"
            className="settings-select"
            value={settings.defaultFilter}
            onChange={handleChange}
          >
            <option value="all">すべて</option>
            <option value="active">未完了</option>
            <option value="completed">完了済み</option>
          </select>
        </div>
      </section>
      
      <section className="settings-section">
        <ArchiveSettings />
      </section>
      
      <div className="settings-actions">
        <button
          className="button button--primary"
          onClick={saveSettings}
        >
          設定を保存
        </button>
        <button
          className="button button--secondary"
          onClick={resetSettings}
        >
          デフォルトに戻す
        </button>
      </div>
      
      {isSaved && (
        <div className="settings-saved-message">
          設定を保存しました
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
