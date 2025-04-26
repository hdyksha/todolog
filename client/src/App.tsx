import type React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './contexts/TaskContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ServerSettingsProvider } from './contexts/ServerSettingsContext';
import { TaskFilesProvider } from './contexts/TaskFilesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { TagProvider } from './contexts/TagContext';
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import TaskDetailPage from './pages/TaskDetailPage';
import SettingsPage from './pages/SettingsPage';
import TagManagementPage from './pages/TagManagementPage';
import NotificationContainer from './components/NotificationContainer';
import ShortcutHelpModal from './components/ShortcutHelpModal';
import './styles/common.css';
import './styles/theme.css';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <ServerSettingsProvider>
            <NotificationProvider>
              <KeyboardShortcutsProvider>
                <TaskProvider>
                  <TaskFilesProvider>
                    <TagProvider>
                      <div className="app">
                        <Routes>
                          <Route path="/" element={<MainLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path="tasks/:id" element={<TaskDetailPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="tags" element={<TagManagementPage />} />
                          </Route>
                        </Routes>
                        <NotificationContainer />
                        <ShortcutHelpModal />
                      </div>
                    </TagProvider>
                  </TaskFilesProvider>
                </TaskProvider>
              </KeyboardShortcutsProvider>
            </NotificationProvider>
          </ServerSettingsProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
