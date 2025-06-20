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
    preferences: {
      notifications: true,
      privacy: 'public',
      language: 'en'
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
    preferences: {
      notifications: true,
      privacy: 'public',
      language: 'en'
    }
  },
];

const mockPosts = [
  {
    id: '1',
    title: 'Amazing Solo Trip to Japan',
    content: 'Just finished an incredible solo journey through Japan. The culture, food, and people were absolutely amazing!',
    user: mockUsers[0],
    createdAt: new Date().toISOString(),
    likes: 24,
    comments: 5,
    isLiked: false,
    isBookmarked: false,
    images: ['https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-161401.jpeg?auto=compress&cs=tinysrgb&w=800']
  },
  {
    id: '2',
    title: 'Solo Backpacking in Europe',
    content: 'Three weeks across 8 countries. Here are my top tips for solo female travelers in Europe.',
    user: mockUsers[1],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: 18,
    comments: 3,
    isLiked: true,
    isBookmarked: true,
    images: ['https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800']
  }
];

const mockComments = [
  {
    id: '1',
    content: 'This looks amazing! Thanks for sharing your experience.',
    author: mockUsers[1],
    createdAt: new Date().toISOString(),
    postId: '1'
  }
];

const mockNotifications = [
  {
    id: '1',
    type: 'like',
    message: 'Jane Smith liked your post',
    createdAt: new Date().toISOString(),
    isRead: false
  },
  {
    id: '2',
    type: 'comment',
    message: 'John Doe commented on your post',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: true
  }
];

const API_BASE_URL = Platform.select({
  web: 'http://localhost:3000/api',
  default: 'https://api.solojourn.com', // Replace with your actual API URL
});

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
    await new Promise(resolve => setTimeout(resolve, 500));

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
        const paginatedResponse: PaginatedResponse<any> = {
          data: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: mockPosts.length,
            totalPages: 1
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
            totalPages: 1
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
            totalPages: 1
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
          data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } as T
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