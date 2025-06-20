import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockThreads = [
  {
    id: '1',
    name: 'Emma Chen',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    lastMessage: 'See you at the cafe tomorrow!',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    name: 'Marcus Silva',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    lastMessage: 'Thanks for the travel tips!',
    time: '1h ago',
    unread: false,
  },
  {
    id: '3',
    name: 'Sofia Rodriguez',
    avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    lastMessage: "Let's plan our next trip!",
    time: '3h ago',
    unread: true,
  },
];

export default function MessagesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: 32 }}>
      <Text style={styles.header}>Messages</Text>
      {mockThreads.map(thread => (
        <TouchableOpacity key={thread.id} style={[styles.threadCard, thread.unread && styles.unreadCard]}>
          <Image source={{ uri: thread.avatar }} style={styles.avatar} />
          <View style={styles.threadContent}>
            <View style={styles.threadHeader}>
              <Text style={styles.name}>{thread.name}</Text>
              <Text style={styles.time}>{thread.time}</Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>{thread.lastMessage}</Text>
          </View>
          {thread.unread && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.newMessageButton}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.newMessageText}>New Message</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 24,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Bold',
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  newMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 24,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 32,
    gap: 8,
  },
  newMessageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
}); 