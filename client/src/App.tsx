import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import { TaskDetailPage } from './pages/TaskDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        {/* 他のルートはここに追加 */}
      </Route>
    </Routes>
  );
}

export default App;
