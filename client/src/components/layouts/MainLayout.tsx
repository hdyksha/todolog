import { Outlet } from 'react-router-dom';
import { useNotification } from '../../store/NotificationContext';
import { Toast } from '../ui/Toast';

export function MainLayout() {
  const { notification, hideNotification } = useNotification();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                TodoLog
              </h1>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                タスク管理アプリケーション
              </span>
            </div>
            <nav className="flex space-x-4">
              {/* ナビゲーションリンクはここに追加 */}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            TodoLog &copy; 2025
          </p>
        </div>
      </footer>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}
    </div>
  );
}
