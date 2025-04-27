import type React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import Notification from './Notification';
import './NotificationContainer.css';

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
