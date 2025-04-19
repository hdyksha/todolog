import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        {/* 他のルートはここに追加 */}
      </Route>
    </Routes>
  );
}

export default App;
