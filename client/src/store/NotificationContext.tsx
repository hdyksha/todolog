import { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notification: Notification | null;
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration = 3000
  ) => {
    // 既存のタイマーをクリア
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    setNotification({ message, type, duration });
    
    if (duration > 0) {
      // 新しいタイマーを設定
      const id = window.setTimeout(() => {
        setNotification(null);
        setTimeoutId(null);
      }, duration);
      setTimeoutId(id);
    }
  };

  const hideNotification = () => {
    setNotification(null);
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
