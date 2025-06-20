import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  UserPlus,
  MapPin,
  Shield,
  Bell,
  Settings,
  Check,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'safety' | 'system';
  user?: {
    name: string;
    avatar: string;
  };
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionable?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Emma Chen',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    },
    title: 'New Like',
    message: 'Emma Chen liked your post about Tokyo ramen shops',
    time: '2 minutes ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'follow',
    user: {
      name: 'Marcus Silva',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    },
    title: 'New Follower',
    message: 'Marcus Silva started following you',
    time: '15 minutes ago',
    isRead: false,
    actionable: true,
  },
  {
    id: '3',
    type: 'comment',
    user: {
      name: 'Sofia Rodriguez',
      avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    },
    title: 'New Comment',
    message: 'Sofia Rodriguez commented: "This looks amazing! Can you share the location?"',
    time: '1 hour ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'safety',
    title: 'Safety Alert',
    message: 'Weather advisory for your current location in Bangkok. Check local conditions.',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: '5',
    type: 'mention',
    user: {
      name: 'Alex Journey',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    },
    title: 'Mentioned You',
    message: 'Alex Journey mentioned you in a forum post about "Best Solo Travel Destinations"',
    time: '4 hours ago',
    isRead: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'Premium Trial Ending',
    message: 'Your premium trial expires in 3 days. Upgrade to continue enjoying premium features.',
    time: '1 day ago',
    isRead: false,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={20} color="#EF4444" fill="#EF4444" />;
      case 'comment':
        return <MessageCircle size={20} color="#0EA5E9" />;
      case 'follow':
        return <UserPlus size={20} color="#10B981" />;
      case 'mention':
        return <MessageCircle size={20} color="#8B5CF6" />;
      case 'safety':
        return <Shield size={20} color="#F59E0B" />;
      case 'system':
        return <Bell size={20} color="#64748B" />;
      default:
        return <Bell size={20} color="#64748B" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || !notif.isRead
  );

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !notification.isRead && styles.unreadCard]}
      onPress={() => markAsRead(notification.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationLeft}>
          {notification.user ? (
            <View style={styles.avatarContainer}>
              <Image source={{ uri: notification.user.avatar }} style={styles.avatar} />
              <View style={styles.iconBadge}>
                {getNotificationIcon(notification.type)}
              </View>
            </View>
          ) : (
            <View style={styles.systemIconContainer}>
              {getNotificationIcon(notification.type)}
            </View>
          )}
          
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>{notification.time}</Text>
          </View>
        </View>

        <View style={styles.notificationActions}>
          {!notification.isRead && (
            <View style={styles.unreadDot} />
          )}
          
          {notification.actionable && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.acceptButton}>
                <Check size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineButton}>
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  settingsButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeFilterTab: {
    backgroundColor: '#0EA5E9',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  markAllButton: {
    marginLeft: 'auto',
  },
  markAllText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  notificationsList: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  systemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  notificationActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0EA5E9',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 6,
  },
  declineButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
});