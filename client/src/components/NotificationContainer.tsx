import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import Notification from './Notification';
import './NotificationContainer.css';

const NotificationContainer: React.FC = () => {
  const { notification, dispatch } = useTaskContext();

  const handleClose = () => {
    dispatch({ type: 'SET_NOTIFICATION', payload: null });
  };

  if (!notification) {
    return null;
  }

  return (
    <div className="notification-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={handleClose}
        duration={notification.duration}
      />
    </div>
  );
};

export default NotificationContainer;
