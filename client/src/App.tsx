import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './contexts/TaskContext';
import './styles/variables.css';
import './App.css';

// ページコンポーネントのインポート（これから作成）
import HomePage from './pages/HomePage';
import TaskDetailPage from './pages/TaskDetailPage';
import SettingsPage from './pages/SettingsPage';
import BackupPage from './pages/BackupPage';
import NotFoundPage from './pages/NotFoundPage';

// レイアウトコンポーネント（これから作成）
import MainLayout from './components/layouts/MainLayout';

function App() {
  return (
    <TaskProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="backups" element={<BackupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </TaskProvider>
  );
}

export default App;
