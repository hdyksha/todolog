import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="main-footer">
        <p>TodoLog &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default MainLayout;
