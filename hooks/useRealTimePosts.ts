import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { apiService } from '../services/api';
import { Post } from '../types';

export function useRealTimePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load posts
  const loadPosts = useCallback(async (pageNum = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiService.getPosts(pageNum, 10);
      if (response.success && response.data) {
        if (refresh || pageNum === 1) {
          setPosts(response.data.data);
        } else {
          setPosts(prev => [...prev, ...response.data.data]);
        }
        setHasMore(response.data.pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load more posts
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
    }
  }, [loading, hasMore, page, loadPosts]);

  // Refresh posts
  const refresh = useCallback(() => {
    loadPosts(1, true);
  }, [loadPosts]);

  // Create post
  const createPost = useCallback(async (postData: any) => {
    try {
      const response = await apiService.createPost(postData);
      if (response.success && response.data) {
        setPosts(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }, []);

  // Like post
  const likePost = useCallback(async (postId: string) => {
    try {
      const response = await apiService.likePost(postId);
      if (response.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked: true, likes: post.likes + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, []);

  // Unlike post
  const unlikePost = useCallback(async (postId: string) => {
    try {
      const response = await apiService.unlikePost(postId);
      if (response.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isLiked: false, likes: Math.max(0, post.likes - 1) }
            : post
        ));
      }
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  }, []);

  // Bookmark post
  const bookmarkPost = useCallback(async (postId: string) => {
    try {
      const response = await apiService.bookmarkPost(postId);
      if (response.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: true }
            : post
        ));
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  }, []);

  // Unbookmark post
  const unbookmarkPost = useCallback(async (postId: string) => {
    try {
      const response = await apiService.unbookmarkPost(postId);
      if (response.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: false }
            : post
        ));
      }
    } catch (error) {
      console.error('Error unbookmarking post:', error);
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    const handlePostLiked = (data: { postId: string; userId: string; likesCount: number }) => {
      setPosts(prev => prev.map(post => 
        post.id === data.postId 
          ? { ...post, likes: data.likesCount }
          : post
      ));
    };

    const handlePostCommented = (data: { postId: string; comment: any }) => {
      setPosts(prev => prev.map(post => 
        post.id === data.postId 
          ? { ...post, comments: post.comments + 1 }
          : post
      ));
    };

    socketService.on('post:liked', handlePostLiked);
    socketService.on('post:commented', handlePostCommented);

    return () => {
      socketService.off('post:liked', handlePostLiked);
      socketService.off('post:commented', handlePostCommented);
    };
  }, []);

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    refreshing,
    hasMore,
    loadMore,
    refresh,
    createPost,
    likePost,
    unlikePost,
    bookmarkPost,
    unbookmarkPost,
  };
}