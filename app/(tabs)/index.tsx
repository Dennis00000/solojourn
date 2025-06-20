import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  RefreshControl,
  Platform,
  Dimensions,
  useWindowDimensions,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRealTimePosts } from '@/hooks/useRealTimePosts';
import { useNotifications } from '@/hooks/useNotifications';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatRelativeTime, formatNumber } from '@/utils/helpers';

interface UserStory {
  image: string;
  text?: string;
  isViewed: boolean;
}

const stories = [
  {
    id: '1',
    user: 'Emma Chen',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isViewed: false,
    isLive: false,
  },
  {
    id: '2',
    user: 'Marcus Silva',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isViewed: true,
    isLive: true,
  },
  {
    id: '3',
    user: 'Sofia Rodriguez',
    avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isViewed: false,
    isLive: false,
  },
];

export default function FeedScreen() {
  const { width } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [storiesRefreshing, setStoriesRefreshing] = useState(false);
  const [storiesData, setStoriesData] = useState(stories);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  const storySwipeX = useRef(new Animated.Value(0)).current;
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [createStoryVisible, setCreateStoryVisible] = useState(false);
  const [newStoryImage, setNewStoryImage] = useState('');
  const [newStoryText, setNewStoryText] = useState('');
  const [userStory, setUserStory] = useState<UserStory | null>(null);
  const [editPostModalVisible, setEditPostModalVisible] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostImage, setEditPostImage] = useState('');
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [actionSheetPostId, setActionSheetPostId] = useState<string | null>(null);
  const [viewedStories, setViewedStories] = useState<{ [id: string]: boolean }>({});
  const [storyProgress, setStoryProgress] = useState(0);
  const storyTimerRef = useRef<any>(null);

  // Use real-time hooks
  const {
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
  } = useRealTimePosts();

  const { unreadCount } = useNotifications();

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (postId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await unbookmarkPost(postId);
      } else {
        await bookmarkPost(postId);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const openStoryModal = (index: number) => {
    setCurrentStoryIndex(index);
    setStoryModalVisible(true);
    storySwipeX.setValue(0);
  };

  const closeStoryModal = () => {
    setStoryModalVisible(false);
    setCurrentStoryIndex(null);
  };

  const handleStorySwipe = (dx: number) => {
    if (dx > 80 && currentStoryIndex !== null && currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      storySwipeX.setValue(0);
    } else if (dx < -80 && currentStoryIndex !== null && currentStoryIndex < storiesData.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      storySwipeX.setValue(0);
    } else {
      Animated.spring(storySwipeX, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  const filterLabel = {
    all: 'All',
    following: 'Following',
    trending: 'Trending',
  };

  const PostCard = ({ post }: { post: any }) => (
    <View style={[
      styles.postCard,
      post.type === 'tip' && styles.tipCard,
      {
        width: Math.min(width - 40, 500),
        alignSelf: 'center',
      },
    ]}>
      {post.type === 'tip' && (
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A']}
          style={styles.tipGradient}
        />
      )}
      
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
            {post.user.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="trophy-outline" size={10} color="#FFD700" />
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{post.user.name}</Text>
              {post.user.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#0EA5E9" />
              )}
            </View>
            <View style={styles.locationRow}>
              {post.location && (
                <>
                  <Ionicons name="location" size={12} color="#64748B" />
                  <Text style={styles.userLocation}>{post.location.name}</Text>
                </>
              )}
              <Text style={styles.timeAgo}>• {formatRelativeTime(post.createdAt)}</Text>
            </View>
            <Text style={styles.followerCount}>{formatNumber(post.user.followers)} followers</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => setActionSheetPostId(post.id)}>
          <Ionicons name="ellipsis-horizontal-circle" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag: string, index: number) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {post.images.map((image: string, index: number) => (
            <TouchableOpacity key={index} style={styles.multiImageContainer}>
              <Image source={{ uri: image }} style={[
                styles.multiImage,
                { width: width > 500 ? 220 : 160, height: width > 500 ? 160 : 120 },
              ]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleLike(post.id, post.isLiked)}
        >
          <Ionicons name={post.isLiked ? "heart" : "heart-outline"} size={22} color={post.isLiked ? '#EF4444' : '#64748B'} />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            {formatNumber(post.likes)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#64748B" />
          <Text style={styles.actionText}>{formatNumber(post.comments)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social" size={22} color="#64748B" />
          <Text style={styles.actionText}>{formatNumber(post.shares)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={() => handleBookmark(post.id, post.isBookmarked)}
        >
          <Ionicons name={post.isBookmarked ? "bookmark" : "bookmark-outline"} size={22} color={post.isBookmarked ? '#0EA5E9' : '#64748B'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const StoryItem = ({ story, index, viewed }: { story: typeof stories[0], index: number, viewed: boolean }) => (
    <TouchableOpacity style={styles.storyContainer} onPress={() => openStoryModal(index)}>
      <View style={[
        styles.storyBorder,
        viewed ? styles.viewedStoryBorder : styles.unviewedStoryBorder
      ]}>
        <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
        {story.isLive && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{story.user}</Text>
    </TouchableOpacity>
  );

  const reloadStories = () => {
    setStoriesRefreshing(true);
    setTimeout(() => {
      setStoriesData([...stories]);
      setStoriesRefreshing(false);
    }, 1200);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewPostImage(result.assets[0].uri);
    }
  };

  const pickStoryImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewStoryImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const postData = {
        content: newPostContent,
        images: newPostImage ? [newPostImage] : [],
        type: newPostImage ? 'image' : 'text',
      };

      await createPost(postData);
      setCreatePostVisible(false);
      setNewPostContent('');
      setNewPostImage('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  useEffect(() => {
    if (storyModalVisible && currentStoryIndex !== null) {
      setStoryProgress(0);
      if (currentStoryIndex === -1 && userStory) {
        setUserStory({ ...userStory, isViewed: true });
      } else if (currentStoryIndex >= 0 && storiesData[currentStoryIndex]) {
        setViewedStories(prev => ({ ...prev, [storiesData[currentStoryIndex].id]: true }));
      }
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
      let progress = 0;
      storyTimerRef.current = setInterval(() => {
        progress += 1;
        setStoryProgress(progress / 100);
        if (progress >= 100) {
          clearInterval(storyTimerRef.current!);
          if (currentStoryIndex === -1) {
            closeStoryModal();
          } else if (currentStoryIndex < storiesData.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
          } else {
            closeStoryModal();
          }
        }
      }, 30);
    }
    return () => {
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    };
  }, [storyModalVisible, currentStoryIndex]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.feedSection, { marginTop: 8 }]}> 
        <LinearGradient
          colors={['#FFFFFF', 'rgba(255,255,255,0.95)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity style={styles.headerTitleRow} activeOpacity={0.7}>
              <Text style={styles.headerTitle}>SoloJourn</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications" size={24} color="#374151" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/premium')}
            >
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/screens/forum')}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
      >
        {/* Stories */}
        <View style={[styles.feedSection, { marginTop: 16, marginBottom: 8 }]}> 
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesScroll}>
            <TouchableOpacity style={styles.addStoryContainer} onPress={() => setCreateStoryVisible(true)}>
              <View style={styles.addStoryButton}>
                <Ionicons name="add-circle" size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.addStoryText}>Your Story</Text>
            </TouchableOpacity>
            {userStory && (
              <TouchableOpacity style={styles.storyContainer} onPress={() => openStoryModal(-1)}>
                <View style={[
                  styles.storyBorder,
                  !userStory.isViewed ? styles.unviewedStoryBorder : styles.viewedStoryBorder
                ]}>
                  <Image source={{ uri: userStory.image }} style={styles.storyAvatar} />
                </View>
                <Text style={styles.storyName} numberOfLines={1}>You</Text>
              </TouchableOpacity>
            )}
            {storiesData.map((story, idx) => (
              <StoryItem key={story.id} story={story} index={idx} viewed={!!viewedStories[story.id]} />
            ))}
          </ScrollView>
        </View>

        {/* Posts Filter */}
        <View style={[styles.feedSection, { marginTop: 8 }]}> 
          <View style={styles.sectionHeader}>
            <TouchableOpacity style={styles.headerTitleRow} onPress={() => setFilterDropdownVisible(true)} activeOpacity={0.7}>
              <Text style={styles.filterLabel}>{filterLabel[selectedFilter]}</Text>
              <Ionicons name={filterDropdownVisible ? 'chevron-up' : 'chevron-down'} size={18} color="#0EA5E9" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          {/* Posts */}
          {loading && posts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size="large" />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="image-outline" size={48} color="#9CA3AF" />
              <Text style={{ fontSize: 18, color: '#64748B', fontWeight: '600', marginTop: 12 }}>No posts yet</Text>
              <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>Be the first to share your adventure!</Text>
            </View>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {loading && (
                <View style={styles.loadMoreContainer}>
                  <LoadingSpinner />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[
        styles.fab,
        width > 500 && { right: (width - 500) / 2 + 20 },
      ]} onPress={() => setCreatePostVisible(true)}>
        <LinearGradient
          colors={['#0EA5E9', '#0284C7']}
          style={styles.fabGradient}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={createPostVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreatePostVisible(false)}
      >
        <Pressable style={styles.createPostOverlay} onPress={() => setCreatePostVisible(false)} />
        <View style={styles.createPostModal}>
          <Text style={styles.createPostTitle}>Create Post</Text>
          <TextInput
            style={styles.createPostInput}
            placeholder="What's on your mind?"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
          />
          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <Ionicons name="image" size={20} color="#0EA5E9" />
            <Text style={styles.addImageButtonText}>{newPostImage ? 'Change Image' : 'Add Image'}</Text>
          </TouchableOpacity>
          {newPostImage ? (
            <Image source={{ uri: newPostImage }} style={styles.createPostImagePreview} />
          ) : null}
          <TouchableOpacity
            style={[styles.createPostButton, !newPostContent.trim() && { opacity: 0.5 }]}
            disabled={!newPostContent.trim()}
            onPress={handleCreatePost}
          >
            <Text style={styles.createPostButtonText}>Post</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createPostCancel} onPress={() => setCreatePostVisible(false)}>
            <Text style={styles.createPostCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Other modals remain the same... */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  feedSection: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0EA5E9',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Poppins-Bold',
  },
  filterLabel: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '600',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  storiesScroll: {
    paddingLeft: 20,
  },
  addStoryContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  addStoryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addStoryText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  storyBorder: {
    padding: 3,
    borderRadius: 32,
    marginBottom: 8,
  },
  unviewedStoryBorder: {
    backgroundColor: '#0EA5E9',
  },
  viewedStoryBorder: {
    backgroundColor: '#E2E8F0',
  },
  storyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  liveIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    transform: [{ translateX: -15 }],
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Bold',
  },
  storyName: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  tipCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  premiumBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 2,
    minWidth: 14,
    minHeight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  timeAgo: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  followerCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  imagesContainer: {
    marginBottom: 12,
  },
  multiImageContainer: {
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  multiImage: {
    width: 160,
    height: 120,
    borderRadius: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  likedText: {
    color: '#EF4444',
  },
  bookmarkButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPostOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  createPostModal: {
    position: 'absolute',
    top: '25%',
    left: 24,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'stretch',
  },
  createPostTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0EA5E9',
    marginBottom: 16,
    textAlign: 'center',
  },
  createPostInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createPostButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createPostCancel: {
    alignItems: 'center',
    marginTop: 12,
  },
  createPostCancelText: {
    color: '#64748B',
    fontSize: 15,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  addImageButtonText: {
    color: '#0EA5E9',
    fontSize: 15,
    fontWeight: '600',
  },
  createPostImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
    marginTop: 4,
    backgroundColor: '#F1F5F9',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  loadMoreContainer: {
    alignItems: 'center',
    padding: 20,
  },
});

export const screenOptions = {
  headerShown: false,
};