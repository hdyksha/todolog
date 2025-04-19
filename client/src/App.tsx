import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './contexts/TaskContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import TaskDetailPage from './pages/TaskDetailPage';
import SettingsPage from './pages/SettingsPage';
import './styles/variables.css';
import './styles/theme.css';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TaskProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tasks/:id" element={<TaskDetailPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<div>ページが見つかりません</div>} />
            </Route>
          </Routes>
        </TaskProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
