import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppProvider } from './store/AppContext';
import { NotificationProvider } from './store/NotificationContext';
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { CACHE_CONFIG } from './services/config';

// React Queryクライアントの設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_CONFIG.staleTime,
      retry: CACHE_CONFIG.retry,
      retryDelay: CACHE_CONFIG.retryDelay,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="tasks/:id" element={<TaskDetailPage />} />
                {/* 他のルートはここに追加 */}
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
