import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../../contexts/KeyboardShortcutsContext';
import TaskFileSelector from './TaskFileSelector';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  
  // グローバルショートカットの登録
  React.useEffect(() => {
    // テーマ切り替えショートカット
    registerShortcut({
      key: 'd',
      ctrlKey: true,
      action: toggleTheme,
      description: 'ダークモード/ライトモード切り替え',
      scope: 'グローバル'
    });
    
    // ホームページへのショートカット
    registerShortcut({
      key: 'g',
      shiftKey: true,
      action: () => navigate('/'),
      description: 'ホームページへ移動',
      scope: 'グローバル'
    });
    
    // 設定ページへのショートカット
    registerShortcut({
      key: ',',
      ctrlKey: true,
      action: () => navigate('/settings'),
      description: '設定ページへ移動',
      scope: 'グローバル'
    });
    
    return () => {
      unregisterShortcut('d', { ctrlKey: true });
      unregisterShortcut('g', { shiftKey: true });
      unregisterShortcut(',', { ctrlKey: true });
    };
  }, [registerShortcut, unregisterShortcut, toggleTheme, navigate]);
  
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
