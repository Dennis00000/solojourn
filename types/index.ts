export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  isVerified: boolean;
  isPremium: boolean;
  followers: number;
  following: number;
  countriesVisited: number;
  rating: number;
  joinedAt: string;
  lastSeen: string;
  isOnline: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    messages: boolean;
    likes: boolean;
    comments: boolean;
    follows: boolean;
  };
  privacy: {
    showLocation: boolean;
    showOnlineStatus: boolean;
    allowMessages: 'everyone' | 'followers' | 'none';
  };
  safety: {
    shareLocation: boolean;
    emergencyContacts: string[];
  };
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  images?: string[];
  location?: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  type: 'text' | 'image' | 'story' | 'tip' | 'safety';
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'location';
  isRead: boolean;
  createdAt: string;
  reactions?: MessageReaction[];
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
  };
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'safety' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  actionUser?: User;
}

export interface SafetyAlert {
  id: string;
  userId: string;
  type: 'emergency' | 'warning' | 'info';
  title: string;
  message: string;
  location?: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface TravelPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destinations: Destination[];
  isPublic: boolean;
  collaborators: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  arrivalDate: string;
  departureDate: string;
  activities: Activity[];
  accommodation?: {
    name: string;
    address: string;
    checkIn: string;
    checkOut: string;
  };
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  cost?: number;
  category: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'activity' | 'other';
}

export interface POI {
  id: string;
  name: string;
  description: string;
  category: 'accommodation' | 'food' | 'activity' | 'safety' | 'transport';
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  reviews: Review[];
  images: string[];
  addedBy: string;
  isVerified: boolean;
  soloFriendly: boolean;
  safetyRating: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  poiId: string;
  userId: string;
  user: User;
  rating: number;
  content: string;
  images?: string[];
  visitDate: string;
  createdAt: string;
  helpful: number;
  isHelpful: boolean;
}

export interface EmergencyContact {
  id: string;
  country: string;
  police: string;
  medical: string;
  fire: string;
  embassy?: string;
  touristHelpline?: string;
}

export interface SafetyTip {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'transport' | 'accommodation' | 'food' | 'health' | 'money' | 'communication';
  region?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}