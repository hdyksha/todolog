import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/" className="navbar-logo">
            TodoLog
          </NavLink>
        </div>

        <button
          className="navbar-toggle"
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span className="navbar-toggle-icon"></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'is-open' : ''}`}>
          <div className="navbar-start">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'navbar-item is-active' : 'navbar-item'
              }
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </NavLink>
            <NavLink
              to="/backups"
              className={({ isActive }) =>
                isActive ? 'navbar-item is-active' : 'navbar-item'
              }
              onClick={() => setIsMenuOpen(false)}
            >
              バックアップ
            </NavLink>
          </div>

          <div className="navbar-end">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? 'navbar-item is-active' : 'navbar-item'
              }
              onClick={() => setIsMenuOpen(false)}
            >
              設定
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
