import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <NavLink to="/" className="logo-link">
            TodoLog
          </NavLink>
        </div>
        
        <ul className="nav-links">
          <li className="nav-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }
              end
            >
              ホーム
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/backups" 
              className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              バックアップ
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              設定
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
