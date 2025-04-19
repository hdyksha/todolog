import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';
import ShortcutHelp from '../ui/ShortcutHelp';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import './MainLayout.css';

// タスク作成モーダルの状態を管理するためのカスタムイベント
const openCreateTaskModalEvent = new CustomEvent('openCreateTaskModal');

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, currentTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // キーボードショートカットの設定
  const shortcuts = [
    {
      key: 'h',
      action: () => navigate('/'),
      description: 'ホーム画面に移動',
    },
    {
      key: 's',
      action: () => navigate('/settings'),
      description: '設定画面に移動',
    },
    {
      key: 'n',
      action: () => {
        // タスク作成モーダルを開くためのカスタムイベントを発火
        window.dispatchEvent(openCreateTaskModalEvent);
      },
      description: '新規タスク作成',
    },
    {
      key: '?',
      action: () => {
        // ショートカットヘルプを表示（実際の実装に合わせて調整）
      },
      description: 'ショートカット一覧を表示',
    },
    {
      key: 'Escape',
      action: () => {
        // モーダルを閉じる処理（実際の実装に合わせて調整）
        setIsMobileMenuOpen(false);
      },
      description: 'モーダルを閉じる',
    },
  ];

  const { getShortcutList } = useKeyboardShortcuts(shortcuts);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="main-layout">
      <header className="header">
        <div className="header__container">
          <div className="header__logo">
            <Link to="/" className="header__logo-link">
              TodoLog
            </Link>
          </div>

          <button
            className="header__mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="メニューを開く"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="header__mobile-menu-icon"></span>
          </button>

          <nav className={`header__nav ${isMobileMenuOpen ? 'header__nav--open' : ''}`}>
            <ul className="header__nav-list">
              <li className="header__nav-item">
                <Link
                  to="/"
                  className={`header__nav-link ${location.pathname === '/' ? 'header__nav-link--active' : ''}`}
                >
                  ホーム
                </Link>
              </li>
              <li className="header__nav-item">
                <Link
                  to="/settings"
                  className={`header__nav-link ${location.pathname === '/settings' ? 'header__nav-link--active' : ''}`}
                >
                  設定
                </Link>
              </li>
              <li className="header__nav-item header__theme-toggle">
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__container">
          <p className="footer__copyright">© 2025 TodoLog</p>
        </div>
      </footer>

      <ShortcutHelp shortcuts={getShortcutList()} />
    </div>
  );
};

export default MainLayout;
