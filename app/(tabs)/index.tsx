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

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    location: string;
    isVerified: boolean;
    isPremium: boolean;
    followers: number;
  };
  content: string;
  image?: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  type: 'text' | 'image' | 'story' | 'tip';
}

interface UserStory {
  image: string;
  text?: string;
  isViewed: boolean;
}

const mockPosts: Post[] = [
  {
    id: '1',
    user: {
      name: 'Emma Chen',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      location: 'Tokyo, Japan',
      isVerified: true,
      isPremium: true,
      followers: 12500,
    },
    content: 'Found this incredible hidden ramen shop in Shibuya! The locals were so welcoming and helped me order. This is why I love solo travel - unexpected moments like these. 🍜✨',
    image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 1247,
    comments: 89,
    shares: 23,
    timeAgo: '2h',
    isLiked: false,
    isBookmarked: false,
    tags: ['ramen', 'tokyo', 'hidden-gems', 'local-culture'],
    type: 'image',
  },
  {
    id: '2',
    user: {
      name: 'Marcus Silva',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      location: 'Lisbon, Portugal',
      isVerified: false,
      isPremium: false,
      followers: 3400,
    },
    content: 'Week 3 in Lisbon and I\'m still discovering new neighborhoods. Slow travel really allows you to connect with places on a deeper level. Just spent the morning chatting with a local artist about the city\'s street art scene.',
    images: [
      'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    likes: 892,
    comments: 156,
    shares: 45,
    timeAgo: '4h',
    isLiked: true,
    isBookmarked: true,
    tags: ['lisbon', 'slow-travel', 'street-art', 'local-connections'],
    type: 'story',
  },
  {
    id: '3',
    user: {
      name: 'Sofia Rodriguez',
      avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      location: 'Chiang Mai, Thailand',
      isVerified: true,
      isPremium: true,
      followers: 8900,
    },
    content: '🛡️ SAFETY TIP: Always let someone know your whereabouts! I use the buddy system even when traveling solo. Met up with another solo traveler from the app today for temple hopping. Having a travel buddy for the day made the experience even more special!',
    image: 'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 2156,
    comments: 234,
    shares: 89,
    timeAgo: '6h',
    isLiked: false,
    isBookmarked: false,
    tags: ['safety', 'buddy-system', 'temples', 'chiang-mai'],
    type: 'tip',
  },
];

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

// Add state for demo user
const demoUsers = [
  {
    name: 'Emma Chen',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
  {
    name: 'Marcus Silva',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
  {
    name: 'Sofia Rodriguez',
    avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  },
];
const [currentUser, setCurrentUser] = useState(demoUsers[0]);

export default function FeedScreen() {
  const { width } = useWindowDimensions();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
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

  // Handle swipe gestures
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

  // Helper for filter label
  const filterLabel = {
    all: 'All',
    following: 'Following',
    trending: 'Trending',
  };

  const PostCard = ({ post }: { post: Post }) => (
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
              <Ionicons name="location" size={12} color="#64748B" />
              <Text style={styles.userLocation}>{post.user.location}</Text>
              <Text style={styles.timeAgo}>• {post.timeAgo}</Text>
            </View>
            <Text style={styles.followerCount}>{post.user.followers.toLocaleString()} followers</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => setActionSheetPostId(post.id)}>
          <Ionicons name="ellipsis-horizontal-circle" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      {post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {post.image && (
        <TouchableOpacity style={styles.imageContainer}>
          <Image source={{ uri: post.image }} style={[
            styles.postImage,
            { height: width > 500 ? 300 : 220 },
          ]} />
        </TouchableOpacity>
      )}
      
      {post.images && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {post.images.map((image, index) => (
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
          onPress={() => handleLike(post.id)}
        >
          <Ionicons name={post.isLiked ? "heart" : "heart-outline"} size={22} color={post.isLiked ? '#EF4444' : '#64748B'} />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            {post.likes.toLocaleString()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#64748B" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social" size={22} color="#64748B" />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={() => handleBookmark(post.id)}
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

  // Individual reload handlers
  const reloadStories = () => {
    setStoriesRefreshing(true);
    setTimeout(() => {
      setStoriesData([...stories]); // Simulate reload
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

  // When a story modal is opened, start the progress bar and mark as viewed
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
      {/* Header with filter chevron */}
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
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
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
      {/* Filters and Posts Scrollable/Refreshable Area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stories Row (no header/label) */}
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
        {/* Posts Section */}
        <View style={[styles.feedSection, { marginTop: 8 }]}> 
          <View style={styles.sectionHeader}>
            <TouchableOpacity style={styles.headerTitleRow} onPress={() => setFilterDropdownVisible(true)} activeOpacity={0.7}>
              <Text style={styles.filterLabel}>{filterLabel[selectedFilter]}</Text>
              <Ionicons name={filterDropdownVisible ? 'chevron-up' : 'chevron-down'} size={18} color="#0EA5E9" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
          {posts.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="image-outline" size={48} color="#9CA3AF" />
              <Text style={{ fontSize: 18, color: '#64748B', fontWeight: '600', marginTop: 12 }}>No posts yet</Text>
              <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>Be the first to share your adventure!</Text>
            </View>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
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
      {/* Story Modal */}
      <Modal
        visible={storyModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeStoryModal}
        statusBarTranslucent
      >
        <View style={styles.storyModalOverlay}>
          <Pressable style={styles.storyModalBackground} onPress={closeStoryModal} />
          {currentStoryIndex !== null && (
            <Animated.View
              style={[
                styles.storyModalContent,
                { transform: [{ translateX: storySwipeX }] },
              ]}
              {...{
                onStartShouldSetResponder: () => true,
                onMoveShouldSetResponder: () => true,
                onResponderMove: (e) => {
                  storySwipeX.setValue(e.nativeEvent.pageX - Dimensions.get('window').width / 2);
                },
                onResponderRelease: (e) => {
                  const dx = e.nativeEvent.pageX - Dimensions.get('window').width / 2;
                  handleStorySwipe(dx);
                },
              }}
            >
              <View style={styles.storyModalHeader}>
                <Image source={{ uri: storiesData[currentStoryIndex].avatar }} style={styles.storyModalAvatar} />
                <Text style={styles.storyModalUser}>{storiesData[currentStoryIndex].user}</Text>
                <TouchableOpacity style={styles.storyModalClose} onPress={closeStoryModal}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.storyModalBody}>
                {/* Placeholder for story content, can be image/video, etc. */}
                <Image
                  source={{ uri: storiesData[currentStoryIndex].avatar }}
                  style={styles.storyModalMainImage}
                  resizeMode="cover"
                />
              </View>
              {/* Left/Right tap zones for navigation */}
              {currentStoryIndex > 0 && (
                <Pressable style={styles.storyModalLeftZone} onPress={() => setCurrentStoryIndex(currentStoryIndex - 1)} />
              )}
              {currentStoryIndex < storiesData.length - 1 && (
                <Pressable style={styles.storyModalRightZone} onPress={() => setCurrentStoryIndex(currentStoryIndex + 1)} />
              )}
              {currentStoryIndex === -1 && userStory && (
                <TouchableOpacity style={styles.createPostCancel} onPress={() => { setUserStory(null); closeStoryModal(); }}>
                  <Text style={[styles.createPostCancelText, { color: '#EF4444' }]}>Delete Story</Text>
                </TouchableOpacity>
              )}
              {storyModalVisible && (
                <View style={styles.storyProgressBarContainer}>
                  <View style={[styles.storyProgressBar, { width: `${storyProgress * 100}%` }]} />
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </Modal>
      {/* Filter Modal */}
      <Modal
        visible={filterDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterDropdownVisible(false)}
      >
        <Pressable style={styles.dropdownOverlay} onPress={() => setFilterDropdownVisible(false)} />
        <View style={styles.dropdownMenuContainer}>
          <View style={styles.dropdownMenu}>
            {['all', 'following', 'trending'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.dropdownMenuItem, selectedFilter === filter && styles.dropdownMenuItemActive]}
                onPress={() => {
                  setSelectedFilter(filter as any);
                  setFilterDropdownVisible(false);
                }}
              >
                <Text style={[styles.dropdownMenuItemText, selectedFilter === filter && styles.dropdownMenuItemTextActive]}>
                  {filterLabel[filter as keyof typeof filterLabel]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
            style={styles.createPostButton}
            onPress={() => {
              if (!newPostContent.trim()) return;
              setPosts([
                {
                  id: Date.now().toString(),
                  user: mockPosts[0].user, // Use first user for now
                  content: newPostContent,
                  image: newPostImage || undefined,
                  likes: 0,
                  comments: 0,
                  shares: 0,
                  timeAgo: 'now',
                  isLiked: false,
                  isBookmarked: false,
                  tags: [],
                  type: newPostImage ? 'image' : 'text',
                },
                ...posts,
              ]);
              setCreatePostVisible(false);
              setNewPostContent('');
              setNewPostImage('');
            }}
          >
            <Text style={styles.createPostButtonText}>Post</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createPostCancel} onPress={() => setCreatePostVisible(false)}>
            <Text style={styles.createPostCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Create Story Modal */}
      <Modal
        visible={createStoryVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateStoryVisible(false)}
      >
        <Pressable style={styles.createPostOverlay} onPress={() => setCreateStoryVisible(false)} />
        <View style={styles.createPostModal}>
          <Text style={styles.createPostTitle}>Add to Your Story</Text>
          <TouchableOpacity style={styles.addImageButton} onPress={pickStoryImage}>
            <Ionicons name="image" size={20} color="#0EA5E9" />
            <Text style={styles.addImageButtonText}>{newStoryImage ? 'Change Image' : 'Add Image'}</Text>
          </TouchableOpacity>
          {newStoryImage ? (
            <Image source={{ uri: newStoryImage }} style={styles.createPostImagePreview} />
          ) : null}
          <TextInput
            style={styles.createPostInput}
            placeholder="Say something (optional)"
            value={newStoryText}
            onChangeText={setNewStoryText}
            multiline
          />
          <TouchableOpacity
            style={[styles.createPostButton, !newStoryImage && { opacity: 0.5 }]}
            disabled={!newStoryImage}
            onPress={() => {
              setUserStory({ image: newStoryImage, text: newStoryText, isViewed: false });
              setCreateStoryVisible(false);
              setNewStoryImage('');
              setNewStoryText('');
            }}
          >
            <Text style={styles.createPostButtonText}>Share to Story</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createPostCancel} onPress={() => setCreateStoryVisible(false)}>
            <Text style={styles.createPostCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Edit Post Modal */}
      <Modal
        visible={!!actionSheetPostId}
        transparent
        animationType="fade"
        onRequestClose={() => setActionSheetPostId(null)}
      >
        <Pressable style={styles.createPostOverlay} onPress={() => setActionSheetPostId(null)} />
        <View style={styles.actionSheetModal}>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => {
              const post = posts.find(p => p.id === actionSheetPostId);
              setEditPostId(post?.id || null);
              setEditPostContent(post?.content || '');
              setEditPostImage(post?.image || '');
              setActionSheetPostId(null);
              setEditPostModalVisible(true);
            }}
          >
            <Text style={styles.actionSheetText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => {
              setDeletePostId(actionSheetPostId);
              setActionSheetPostId(null);
            }}
          >
            <Text style={[styles.actionSheetText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionSheetItem} onPress={() => setActionSheetPostId(null)}>
            <Text style={styles.actionSheetText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Edit Post Modal */}
      <Modal
        visible={editPostModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditPostModalVisible(false)}
      >
        <Pressable style={styles.createPostOverlay} onPress={() => setEditPostModalVisible(false)} />
        <View style={styles.createPostModal}>
          <Text style={styles.createPostTitle}>Edit Post</Text>
          <TextInput
            style={styles.createPostInput}
            placeholder="What's on your mind?"
            value={editPostContent}
            onChangeText={setEditPostContent}
            multiline
          />
          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <Ionicons name="image" size={20} color="#0EA5E9" />
            <Text style={styles.addImageButtonText}>{editPostImage ? 'Change Image' : 'Add Image'}</Text>
          </TouchableOpacity>
          {editPostImage ? (
            <Image source={{ uri: editPostImage }} style={styles.createPostImagePreview} />
          ) : null}
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => {
              setPosts(posts.map(post =>
                post.id === editPostId
                  ? { ...post, content: editPostContent, image: editPostImage }
                  : post
              ));
              setEditPostModalVisible(false);
              setEditPostId(null);
              setEditPostContent('');
              setEditPostImage('');
            }}
          >
            <Text style={styles.createPostButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createPostCancel} onPress={() => setEditPostModalVisible(false)}>
            <Text style={styles.createPostCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Delete confirmation modal */}
      <Modal
        visible={!!deletePostId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletePostId(null)}
      >
        <Pressable style={styles.createPostOverlay} onPress={() => setDeletePostId(null)} />
        <View style={styles.actionSheetModal}>
          <Text style={[styles.createPostTitle, { fontSize: 17, marginBottom: 12 }]}>Delete this post?</Text>
          <TouchableOpacity
            style={styles.actionSheetItem}
            onPress={() => {
              setPosts(posts.filter(post => post.id !== deletePostId));
              setDeletePostId(null);
            }}
          >
            <Text style={[styles.actionSheetText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionSheetItem} onPress={() => setDeletePostId(null)}>
            <Text style={styles.actionSheetText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Poppins-SemiBold',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0EA5E9',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  createPostText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
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
  horizontalScroll: {
    paddingLeft: 20,
  },
  travelerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    alignItems: 'center',
    width: 130,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  travelerAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  travelerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  travelerPremiumBadge: {
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
  travelerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  travelerBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  travelerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F59E0B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  countries: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
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
  imageContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
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
  storyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyModalBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  storyModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  storyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    width: '100%',
    zIndex: 2,
  },
  storyModalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  storyModalUser: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  storyModalClose: {
    padding: 8,
  },
  storyModalBody: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyModalMainImage: {
    width: '90%',
    height: '70%',
    borderRadius: 24,
    backgroundColor: '#222',
  },
  storyModalLeftZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '30%',
    height: '100%',
    zIndex: 10,
  },
  storyModalRightZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '30%',
    height: '100%',
    zIndex: 10,
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownMenuContainer: {
    position: 'absolute',
    top: 70,
    left: 32,
    right: 32,
    zIndex: 100,
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 12,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#E0F2FE',
  },
  dropdownMenuItemText: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  dropdownMenuItemTextActive: {
    color: '#0284C7',
    fontWeight: '700',
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
  actionSheetModal: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: '35%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  actionSheetItem: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionSheetText: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  storyProgressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    zIndex: 20,
  },
  storyProgressBar: {
    height: 4,
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },
});

export const screenOptions = {
  headerShown: false,
};