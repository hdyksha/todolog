import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import TaskFileSelector from './TaskFileSelector';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // 現在のパスに基づいてナビゲーションアイテムのアクティブ状態を判定
  const isActive = (path: string) => {
    return location.pathname === path ? 'nav-item--active' : '';
  };

  return (
    <div className={`app-container ${theme}`}>
      <header className="header">
        <div className="header__content">
          <div className="header__logo">
            <Link to="/" className="logo-link">TodoLog</Link>
          </div>
          
          <div className="header__actions">
            <TaskFileSelector />
            <nav className="nav">
              <ul className="nav-list">
                <li className={`nav-item ${isActive('/')}`}>
                  <Link to="/" className="nav-link">タスク</Link>
                </li>
                <li className={`nav-item ${isActive('/settings')}`}>
                  <Link to="/settings" className="nav-link">設定</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <Outlet />
      </main>
      
      <footer className="footer">
        <div className="footer__content">
          <p className="footer__text">
            &copy; {new Date().getFullYear()} TodoLog - シンプルなタスク管理アプリ
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
