import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { apiService } from '../services/api';
import { Message, Conversation } from '../types';

export function useRealTimeMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [typingUsers, setTypingUsers] = useState<{ [conversationId: string]: string[] }>({});
  const [loading, setLoading] = useState(false);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await apiService.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: response.data.data,
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (conversationId: string, content: string, type = 'text') => {
    try {
      const response = await apiService.sendMessage(conversationId, content, type);
      if (response.success && response.data) {
        // Message will be added via socket event
        socketService.sendMessage(conversationId, response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, []);

  // Join conversation
  const joinConversation = useCallback((conversationId: string) => {
    setActiveConversation(conversationId);
    socketService.joinConversation(conversationId);
    if (!messages[conversationId]) {
      loadMessages(conversationId);
    }
  }, [messages, loadMessages]);

  // Leave conversation
  const leaveConversation = useCallback(() => {
    if (activeConversation) {
      socketService.leaveConversation(activeConversation);
      setActiveConversation(null);
    }
  }, [activeConversation]);

  // Set typing status
  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    socketService.setTyping(conversationId, isTyping);
  }, []);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await apiService.markMessageAsRead(messageId);
      socketService.markMessageAsRead(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] || []), message],
      }));

      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
          : conv
      ));
    };

    const handleMessageRead = (data: { messageId: string; readBy: string }) => {
      // Update message read status
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(conversationId => {
          updated[conversationId] = updated[conversationId].map(msg =>
            msg.id === data.messageId ? { ...msg, isRead: true } : msg
          );
        });
        return updated;
      });
    };

    const handleTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const current = prev[data.conversationId] || [];
        if (data.isTyping) {
          return {
            ...prev,
            [data.conversationId]: current.includes(data.userId) 
              ? current 
              : [...current, data.userId],
          };
        } else {
          return {
            ...prev,
            [data.conversationId]: current.filter(id => id !== data.userId),
          };
        }
      });
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('message:read', handleMessageRead);
    socketService.on('message:typing', handleTyping);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:read', handleMessageRead);
      socketService.off('message:typing', handleTyping);
    };
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    messages,
    typingUsers,
    activeConversation,
    loading,
    sendMessage,
    joinConversation,
    leaveConversation,
    setTyping,
    markAsRead,
    loadConversations,
    loadMessages,
  };
}