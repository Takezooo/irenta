import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { GetToken } from '../utils/Token';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const authToken = GetToken();
    try {
      const { data } = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.viewed).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsViewed = async (notificationId) => {
    const authToken = GetToken();
    try {
      await axios.post(
        'http://localhost:5000/api/notifications/mark-as-viewed',
        { notificationId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as viewed:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsViewed }}>
      {children}
    </NotificationContext.Provider>
  );
};
