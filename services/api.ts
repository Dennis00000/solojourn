import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, PaginatedResponse } from '../types';

// Mock data for development
const mockUsers = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    isVerified: true,
    isPremium: false,
    followers: 1250,
    following: 890,
    countriesVisited: 15,
    rating: 4.8,
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    isOnline: true,
    preferences: {
      notifications: {
        push: true,
        email: true,
        messages: true,
        likes: true,
        comments: true,
        follows: true,
      },
      privacy: {
        showLocation: true,
        showOnlineStatus: true,
        allowMessages: 'everyone' as const,
      },
      safety: {
        shareLocation: false,
        emergencyContacts: [],
      },
    }
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    isVerified: false,
    isPremium: true,
    followers: 890,
    following: 1200,
    countriesVisited: 23,
    rating: 4.9,
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    isOnline: false,
    preferences: {
      notifications: {
        push: true,
        email: false,
        messages: true,
        likes: false,
        comments: true,
        follows: true,
      },
      privacy: {
        showLocation: false,
        showOnlineStatus: false,
        allowMessages: 'followers' as const,
      },
      safety: {
        shareLocation: true,
        emergencyContacts: ['emergency@example.com'],
      },
    }
  },
];

const mockPosts = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    content: 'Just finished an incredible solo journey through Japan. The culture, food, and people were absolutely amazing! 🇯🇵',
    images: ['https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-161401.jpeg?auto=compress&cs=tinysrgb&w=800'],
    location: {
      name: 'Tokyo, Japan',
      coordinates: { latitude: 35.6762, longitude: 139.6503 }
    },
    tags: ['japan', 'solo-travel', 'culture', 'food'],
    likes: 124,
    comments: 15,
    shares: 8,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'image' as const,
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    content: 'Three weeks across 8 countries in Europe. Here are my top safety tips for solo female travelers! 💪',
    images: ['https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800'],
    location: {
      name: 'Barcelona, Spain',
      coordinates: { latitude: 41.3851, longitude: 2.1734 }
    },
    tags: ['europe', 'safety', 'female-travel', 'tips'],
    likes: 89,
    comments: 23,
    shares: 12,
    isLiked: true,
    isBookmarked: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'tip' as const,
  }
];

const mockComments = [
  {
    id: '1',
    postId: '1',
    userId: '2',
    user: mockUsers[1],
    content: 'This looks amazing! Thanks for sharing your experience.',
    likes: 5,
    isLiked: false,
    createdAt: new Date().toISOString(),
    replies: []
  }
];

const mockNotifications = [
  {
    id: '1',
    userId: '1',
    type: 'like' as const,
    title: 'New Like',
    message: 'Jane Smith liked your post',
    data: { postId: '1', userId: '2' },
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUser: mockUsers[1]
  },
  {
    id: '2',
    userId: '1',
    type: 'comment' as const,
    title: 'New Comment',
    message: 'John Doe commented on your post',
    data: { postId: '1', commentId: '1', userId: '1' },
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    actionUser: mockUsers[0]
  }
];

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.select({
  web: 'http://localhost:3000/api',
  default: 'https://api.solojourn.com',
}));

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private useMockData: boolean = true; // Set to false when you have a real backend

  constructor() {
    this.baseURL = API_BASE_URL;
    this.initializeToken();
  }

  private async initializeToken() {
    try {
      this.token = await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!this.token) {
      this.token = await AsyncStorage.getItem('userToken');
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async mockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    try {
      // Mock different endpoints
      if (endpoint.includes('/auth/login')) {
        const mockToken = 'mock-jwt-token-' + Date.now();
        const mockUser = mockUsers[0];
        return {
          success: true,
          data: { token: mockToken, user: mockUser } as T
        };
      }

      if (endpoint.includes('/auth/register')) {
        const mockToken = 'mock-jwt-token-' + Date.now();
        const mockUser = { ...mockUsers[0], name: 'New User' };
        return {
          success: true,
          data: { token: mockToken, user: mockUser } as T
        };
      }

      if (endpoint.includes('/users/profile')) {
        return {
          success: true,
          data: mockUsers[0] as T
        };
      }

      if (endpoint.includes('/posts') && !endpoint.includes('/comments')) {
        if (options.method === 'POST') {
          const body = JSON.parse(options.body as string);
          const newPost = {
            id: Date.now().toString(),
            userId: '1',
            user: mockUsers[0],
            content: body.content,
            images: body.images || [],
            location: body.location,
            tags: body.tags || [],
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isBookmarked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: body.type || 'text',
          };
          return {
            success: true,
            data: newPost as T
          };
        }

        const paginatedResponse: PaginatedResponse<any> = {
          data: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: mockPosts.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          }
        };
        return {
          success: true,
          data: paginatedResponse as T
        };
      }

      if (endpoint.includes('/comments')) {
        const paginatedResponse: PaginatedResponse<any> = {
          data: mockComments,
          pagination: {
            page: 1,
            limit: 10,
            total: mockComments.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          }
        };
        return {
          success: true,
          data: paginatedResponse as T
        };
      }

      if (endpoint.includes('/notifications')) {
        const paginatedResponse: PaginatedResponse<any> = {
          data: mockNotifications,
          pagination: {
            page: 1,
            limit: 20,
            total: mockNotifications.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          }
        };
        return {
          success: true,
          data: paginatedResponse as T
        };
      }

      if (endpoint.includes('/messages/conversations')) {
        return {
          success: true,
          data: [] as T
        };
      }

      if (endpoint.includes('/travel-plans')) {
        return {
          success: true,
          data: [] as T
        };
      }

      if (endpoint.includes('/pois')) {
        return {
          success: true,
          data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } } as T
        };
      }

      if (endpoint.includes('/safety')) {
        return {
          success: true,
          data: [] as T
        };
      }

      // Default success response for other endpoints
      return {
        success: true,
        data: {} as T
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock API error'
      };
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Use mock data if enabled or if we're on web platform (for development)
    if (this.useMockData || Platform.OS === 'web') {
      return this.mockRequest<T>(endpoint, options);
    }

    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      await AsyncStorage.setItem('userToken', this.token);
    }

    return response;
  }

  async register(email: string, password: string, name: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      await AsyncStorage.setItem('userToken', this.token);
    }

    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    await AsyncStorage.removeItem('userToken');
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserById(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async followUser(userId: string) {
    return this.request(`/users/${userId}/follow`, { method: 'POST' });
  }

  async unfollowUser(userId: string) {
    return this.request(`/users/${userId}/unfollow`, { method: 'POST' });
  }

  // Posts endpoints
  async getPosts(page = 1, limit = 10) {
    return this.request<PaginatedResponse<any>>(`/posts?page=${page}&limit=${limit}`);
  }

  async getPostById(postId: string) {
    return this.request(`/posts/${postId}`);
  }

  async createPost(data: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(postId: string, data: any) {
    return this.request(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string) {
    return this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async likePost(postId: string) {
    return this.request(`/posts/${postId}/like`, { method: 'POST' });
  }

  async unlikePost(postId: string) {
    return this.request(`/posts/${postId}/unlike`, { method: 'POST' });
  }

  async bookmarkPost(postId: string) {
    return this.request(`/posts/${postId}/bookmark`, { method: 'POST' });
  }

  async unbookmarkPost(postId: string) {
    return this.request(`/posts/${postId}/unbookmark`, { method: 'POST' });
  }

  // Comments endpoints
  async getComments(postId: string, page = 1, limit = 10) {
    return this.request<PaginatedResponse<any>>(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
  }

  async createComment(postId: string, content: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: string) {
    return this.request(`/comments/${commentId}`, { method: 'DELETE' });
  }

  // Messages endpoints
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    return this.request<PaginatedResponse<any>>(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`);
  }

  async sendMessage(conversationId: string, content: string, type = 'text') {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content, type }),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, { method: 'PUT' });
  }

  // Notifications endpoints
  async getNotifications(page = 1, limit = 20) {
    return this.request<PaginatedResponse<any>>(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  // POI endpoints
  async getPOIs(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request<PaginatedResponse<any>>(`/pois?${queryParams}`);
  }

  async createPOI(data: any) {
    return this.request('/pois', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPOIById(poiId: string) {
    return this.request(`/pois/${poiId}`);
  }

  // Safety endpoints
  async getSafetyTips(region?: string, category?: string) {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (category) params.append('category', category);
    return this.request(`/safety/tips?${params.toString()}`);
  }

  async getEmergencyContacts(country: string) {
    return this.request(`/safety/emergency-contacts/${country}`);
  }

  async reportSafetyIssue(data: any) {
    return this.request('/safety/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Travel plans endpoints
  async getTravelPlans() {
    return this.request('/travel-plans');
  }

  async createTravelPlan(data: any) {
    return this.request('/travel-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTravelPlan(planId: string, data: any) {
    return this.request(`/travel-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTravelPlan(planId: string) {
    return this.request(`/travel-plans/${planId}`, { method: 'DELETE' });
  }

  // File upload
  async uploadFile(file: any, type: 'image' | 'audio' | 'document') {
    if (this.useMockData || Platform.OS === 'web') {
      // Mock file upload response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          url: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800',
          filename: 'mock-upload.jpg'
        }
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const headers = await this.getHeaders();
    delete headers['Content-Type']; // Let browser set content-type for FormData

    try {
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Method to switch between mock and real API
  setUseMockData(useMock: boolean) {
    this.useMockData = useMock;
  }
}

export const apiService = new ApiService();