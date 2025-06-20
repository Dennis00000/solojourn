import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { socketService } from '../services/socket';
import { apiService } from '../services/api';
import { Notification } from '../types';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });

      setExpoPushToken(token.data);
      
      // Send token to backend
      // await apiService.updatePushToken(token.data);
      
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Show local notification
  const showLocalNotification = useCallback(async (title: string, body: string, data?: any) => {
    if (Platform.OS === 'web') {
      // Use browser notifications on web
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, data });
      }
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    });
  }, []);

  // Socket event handlers
  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }

      // Show local notification
      showLocalNotification(notification.title, notification.message, notification.data);
    };

    socketService.on('notification:new', handleNewNotification);

    return () => {
      socketService.off('notification:new', handleNewNotification);
    };
  }, [showLocalNotification]);

  // Handle notification responses
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Handle notification tap - navigate to relevant screen
      console.log('Notification tapped:', data);
    });

    return () => subscription.remove();
  }, []);

  // Load notifications and register for push notifications on mount
  useEffect(() => {
    loadNotifications();
    registerForPushNotifications();
  }, [loadNotifications, registerForPushNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    expoPushToken,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    showLocalNotification,
  };
}