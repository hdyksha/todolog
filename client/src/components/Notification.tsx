import type React from 'react';
import { useEffect } from 'react';
import './Notification.css';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  id: number;
  message: string;
  type: NotificationType;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className={`notification notification--${type}`}>
      <div className="notification__content">
        {message}
      </div>
      <button className="notification__close" onClick={onClose} type="button">
        ×
      </button>
    </div>
  );
};

export default Notification;
