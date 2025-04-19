import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as 'light' | 'dark' | 'system');
  };

  return (
    <div className="theme-toggle">
      <label htmlFor="theme-select" className="theme-toggle__label">
        テーマ
      </label>
      <select
        id="theme-select"
        className="theme-toggle__select"
        value={theme}
        onChange={handleThemeChange}
        aria-label="テーマを選択"
      >
        <option value="light">ライトモード</option>
        <option value="dark">ダークモード</option>
        <option value="system">システム設定に合わせる</option>
      </select>
    </div>
  );
};

export default ThemeToggle;
