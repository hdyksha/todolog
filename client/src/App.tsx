import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './contexts/TaskContext';
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import TaskDetailPage from './pages/TaskDetailPage';
import './styles/variables.css';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <TaskProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
            <Route path="*" element={<div>ページが見つかりません</div>} />
          </Route>
        </Routes>
      </TaskProvider>
    </BrowserRouter>
  );
};

export default App;
