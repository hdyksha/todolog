import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import './ArchiveSettings.css';

const ArchiveSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleShowArchiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ showArchive: e.target.checked });
  };

  const handleAutoExpandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ autoExpandArchive: e.target.checked });
  };

  const handleShowStatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ showArchiveStats: e.target.checked });
  };

  return (
    <div className="archive-settings">
      <h3 className="settings-section-title">アーカイブ設定</h3>
      
      <div className="settings-option">
        <label htmlFor="show-archive" className="settings-label">
          <input
            type="checkbox"
            id="show-archive"
            checked={settings.showArchive}
            onChange={handleShowArchiveChange}
            className="settings-checkbox"
          />
          <span className="settings-text">アーカイブセクションを表示する</span>
        </label>
      </div>
      
      <div className="settings-option">
        <label htmlFor="auto-expand-archive" className="settings-label">
          <input
            type="checkbox"
            id="auto-expand-archive"
            checked={settings.autoExpandArchive}
            onChange={handleAutoExpandChange}
            className="settings-checkbox"
            disabled={!settings.showArchive}
          />
          <span className="settings-text">アーカイブを自動的に展開する</span>
        </label>
      </div>
      
      <div className="settings-option">
        <label htmlFor="show-archive-stats" className="settings-label">
          <input
            type="checkbox"
            id="show-archive-stats"
            checked={settings.showArchiveStats}
            onChange={handleShowStatsChange}
            className="settings-checkbox"
            disabled={!settings.showArchive}
          />
          <span className="settings-text">アーカイブ統計を表示する</span>
        </label>
      </div>
    </div>
  );
};

export default ArchiveSettings;
