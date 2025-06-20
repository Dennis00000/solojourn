import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Notification, User } from '../types';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || Platform.select({
  web: 'http://localhost:3000',
  default: 'https://api.solojourn.com',
});

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();
  private useMockMode = true; // Set to false when you have a real socket server

  async connect() {
    if (this.useMockMode) {
      console.log('Socket service running in mock mode');
      this.simulateConnection();
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found, skipping socket connection');
        return;
      }

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  private simulateConnection() {
    // Simulate successful connection in mock mode
    setTimeout(() => {
      this.isConnected = true;
      this.emit('socket:connected');
    }, 1000);
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket:connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('socket:disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.handleReconnect();
    });

    // Message events
    this.socket.on('message:new', (message: Message) => {
      this.emit('message:new', message);
    });

    this.socket.on('message:read', (data: { messageId: string; readBy: string }) => {
      this.emit('message:read', data);
    });

    this.socket.on('message:typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      this.emit('message:typing', data);
    });

    // Notification events
    this.socket.on('notification:new', (notification: Notification) => {
      this.emit('notification:new', notification);
    });

    // User presence events
    this.socket.on('user:online', (userId: string) => {
      this.emit('user:online', userId);
    });

    this.socket.on('user:offline', (userId: string) => {
      this.emit('user:offline', userId);
    });

    // Post events
    this.socket.on('post:liked', (data: { postId: string; userId: string; likesCount: number }) => {
      this.emit('post:liked', data);
    });

    this.socket.on('post:commented', (data: { postId: string; comment: any }) => {
      this.emit('post:commented', data);
    });

    // Safety events
    this.socket.on('safety:alert', (alert: any) => {
      this.emit('safety:alert', alert);
    });

    // Location sharing events
    this.socket.on('location:shared', (data: { userId: string; location: any }) => {
      this.emit('location:shared', data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached');
      this.emit('socket:reconnect_failed');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  // Socket actions (mock implementations)
  joinConversation(conversationId: string) {
    if (this.useMockMode) {
      console.log(`Mock: Joined conversation ${conversationId}`);
      return;
    }
    
    if (this.socket && this.isConnected) {
      this.socket.emit('conversation:join', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.useMockMode) {
      console.log(`Mock: Left conversation ${conversationId}`);
      return;
    }
    
    if (this.socket && this.isConnected) {
      this.socket.emit('conversation:leave', conversationId);
    }
  }

  sendMessage(conversationId: string, message: any) {
    if (this.useMockMode) {
      console.log(`Mock: Sent message to conversation ${conversationId}`, message);
      return;
    }
    
    if (this.socket && this.isConnected) {
      this.socket.emit('message:send', { conversationId, ...message });
    }
  }

  markMessageAsRead(messageId: string) {
    if (this.useMockMode) {
      console.log(`Mock: Marked message ${messageId} as read`);
      return;
    }
    
    if (this.socket && this.isConnected) {
      this.socket.emit('message:read', messageId);
    }
  }

  setTyping(conversationId: string, isTyping: boolean) {
    if (this.useMockMode) {
      console.log(`Mock: Set typing ${isTyping} for conversation ${conversationId}`);
      return;
    }
    
    if (this.socket && this.isConnected) {
      this.socket.emit('message:typing', { conversationId, isTyping });
    }
  }

  shareLocation(location: { latitude: number; longitude: number }) {
    if (this.useMockMode) {
      console.log('Mock: Shared location', location);
      return;
    }
    
    if (this.socket && this.isConnected) {
      this.socket.emit('location:share', location);
    }
  }

  sendSafetyAlert(alert: any) {
    if (this.useMockMode) {
      console.log('Mock: Sent safety alert', alert);
      return;
    }
    
    if (this.socket && this.isConnected) {
      this.socket.emit('safety:alert', alert);
    }
  }

  updatePresence(status: 'online' | 'away' | 'offline') {
    if (this.useMockMode) {
      console.log(`Mock: Updated presence to ${status}`);
      return;
    }
    
    if (this.socket && this.isConnected) {
      this.socket.emit('user:presence', status);
    }
  }

  // Getters
  get connected() {
    return this.isConnected;
  }

  get socketId() {
    return this.socket?.id || 'mock-socket-id';
  }

  // Method to switch between mock and real socket
  setUseMockMode(useMock: boolean) {
    this.useMockMode = useMock;
  }
}

export const socketService = new SocketService();