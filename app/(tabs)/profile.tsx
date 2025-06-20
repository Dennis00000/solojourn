import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { storageService } from '@/utils/storage';

interface TravelLog {
  id: string;
  destination: string;
  country: string;
  date: string;
  image: string;
  description: string;
  likes: number;
  isLiked: boolean;
}

const mockTravelLogs: TravelLog[] = [
  {
    id: '1',
    destination: 'Tokyo',
    country: 'Japan',
    date: 'Dec 2024',
    image: 'https://images.pexels.com/photos/248195/pexels-photo-248195.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Amazing solo adventure in Tokyo! The culture, food, and people were incredible.',
    likes: 124,
    isLiked: true,
  },
  {
    id: '2',
    destination: 'Lisbon',
    country: 'Portugal',
    date: 'Nov 2024',
    image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Three weeks of slow travel in Lisbon. Perfect for solo exploration.',
    likes: 89,
    isLiked: false,
  },
  {
    id: '3',
    destination: 'Chiang Mai',
    country: 'Thailand',
    date: 'Oct 2024',
    image: 'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Digital nomad heaven! Great community and co-working spaces.',
    likes: 156,
    isLiked: true,
  },
  {
    id: '4',
    destination: 'Medellín',
    country: 'Colombia',
    date: 'Sep 2024',
    image: 'https://images.pexels.com/photos/3849167/pexels-photo-3849167.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Unexpected gem for solo travelers. Vibrant culture and amazing food scene.',
    likes: 203,
    isLiked: true,
  },
];

const achievements = [
  { id: '1', title: 'First Solo Trip', icon: '🌟', earned: true },
  { id: '2', title: '10 Countries Visited', icon: '🌍', earned: true },
  { id: '3', title: 'Community Helper', icon: '🤝', earned: true },
  { id: '4', title: 'Safety Advocate', icon: '🛡️', earned: false },
];

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'posts' | 'saved' | 'itineraries'>('posts');
  const [travelLogs, setTravelLogs] = useState<TravelLog[]>(mockTravelLogs);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Emma Chen',
    bio: 'Solo traveler exploring the world one city at a time 📍 Digital nomad sharing authentic travel experiences and safety tips for fellow solo adventurers ✈️',
    location: 'Currently in Tokyo, Japan',
    email: 'emma@example.com',
  });
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await storageService.getUserProfile();
      if (profile) {
        setUserProfile(profile);
        setEditedProfile(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveUserProfile = async () => {
    try {
      await storageService.setUserProfile(editedProfile);
      setUserProfile(editedProfile);
      setEditProfileVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLike = (logId: string) => {
    setTravelLogs(logs => logs.map(log => 
      log.id === logId 
        ? { 
            ...log, 
            isLiked: !log.isLiked, 
            likes: log.isLiked ? log.likes - 1 : log.likes + 1 
          }
        : log
    ));
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // Clear all user data
      await AsyncStorage.multiRemove([
        'userToken',
        'userName',
        'userProfile',
        'userPreferences',
        'hasLaunched'
      ]);
      
      // Clear cache
      await storageService.clearCache();
      
      // Call auth service sign out
      await signOut();
      
      setSignOutModalVisible(false);
      
      // Navigate to auth screen
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  const TravelLogCard = ({ log }: { log: TravelLog }) => (
    <View style={styles.travelLogCard}>
      <Image source={{ uri: log.image }} style={styles.travelLogImage} />
      <View style={styles.travelLogOverlay}>
        <View style={styles.travelLogHeader}>
          <View>
            <Text style={styles.destinationName}>{log.destination}</Text>
            <Text style={styles.countryName}>{log.country}</Text>
            <Text style={styles.travelDate}>{log.date}</Text>
          </View>
        </View>
      </View>
      <View style={styles.travelLogContent}>
        <Text style={styles.travelLogDescription} numberOfLines={2}>
          {log.description}
        </Text>
        <View style={styles.travelLogActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(log.id)}
          >
            <Ionicons name="heart" size={16} color={log.isLiked ? '#EF4444' : '#64748B'} />
            <Text style={[styles.actionText, log.isLiked && styles.likedText]}>
              {log.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble" size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const TabButton = ({ title, isActive, onPress }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <SafeAreaView edges={['top']} style={styles.fixedHeader}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setEditProfileVisible(true)}
            >
              <Ionicons name="pencil" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/screens/settings')}
            >
              <Ionicons name="settings-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={() => router.push('/screens/settings')}
          >
            <Ionicons name="settings-outline" size={20} color="#0EA5E9" />
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={() => router.push('/screens/itineraries')}
          >
            <Ionicons name="calendar-outline" size={20} color="#0EA5E9" />
            <Text style={styles.quickActionText}>Itineraries</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={() => router.push('/premium')}
          >
            <Ionicons name="trophy-outline" size={20} color="#FFD700" />
            <Text style={styles.quickActionText}>Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userProfile.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#64748B" />
            <Text style={styles.currentLocation}>{userProfile.location}</Text>
          </View>
          
          <Text style={styles.userBio}>{userProfile.bio}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.1K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>456</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setEditProfileVisible(true)}
            >
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={() => setSignOutModalVisible(true)}
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.achievementCardDisabled
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleDisabled
                ]}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsContainer}>
            <TabButton
              title="My Posts"
              isActive={selectedTab === 'posts'}
              onPress={() => setSelectedTab('posts')}
            />
            <TabButton
              title="Saved"
              isActive={selectedTab === 'saved'}
              onPress={() => setSelectedTab('saved')}
            />
            <TabButton
              title="Itineraries"
              isActive={selectedTab === 'itineraries'}
              onPress={() => setSelectedTab('itineraries')}
            />
          </View>

          {/* Travel Logs Grid */}
          {selectedTab === 'posts' && (
            <View style={styles.travelLogsGrid}>
              {travelLogs.map((log) => (
                <TravelLogCard key={log.id} log={log} />
              ))}
            </View>
          )}

          {selectedTab === 'saved' && (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No Saved Content</Text>
              <Text style={styles.emptyStateDescription}>
                Save posts and places you want to remember for later
              </Text>
            </View>
          )}

          {selectedTab === 'itineraries' && (
            <View style={styles.emptyState}>
              <Ionicons name="navigate" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No Itineraries Yet</Text>
              <Text style={styles.emptyStateDescription}>
                Create and share your travel plans with the community
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/screens/itineraries')}
              >
                <Text style={styles.createButtonText}>Create Itinerary</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditProfileVisible(false)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editedProfile.name}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedProfile.bio}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={editedProfile.location}
              onChangeText={(text) => setEditedProfile(prev => ({ ...prev, location: text }))}
              placeholder="Where are you now?"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity style={styles.modalButton} onPress={saveUserProfile}>
            <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.modalButtonGradient}>
              <Text style={styles.modalButtonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.modalCancelButton} 
            onPress={() => setEditProfileVisible(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={signOutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSignOutModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSignOutModalVisible(false)} />
        <View style={styles.signOutModalContent}>
          <View style={styles.signOutIconContainer}>
            <Ionicons name="log-out-outline" size={48} color="#EF4444" />
          </View>
          
          <Text style={styles.signOutModalTitle}>Sign Out</Text>
          <Text style={styles.signOutModalMessage}>
            Are you sure you want to sign out? You'll need to sign in again to access your account.
          </Text>

          <View style={styles.signOutModalButtons}>
            <TouchableOpacity 
              style={styles.signOutCancelButton}
              onPress={() => setSignOutModalVisible(false)}
              disabled={signingOut}
            >
              <Text style={styles.signOutCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.signOutConfirmButton, signingOut && styles.signOutConfirmButtonDisabled]}
              onPress={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <View style={styles.signOutLoadingContainer}>
                  <Ionicons name="hourglass-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.signOutConfirmText}>Signing Out...</Text>
                </View>
              ) : (
                <Text style={styles.signOutConfirmText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#0EA5E9',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  currentLocation: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  userBio: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  signOutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
  },
  signOutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  achievementsSection: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  achievementsScroll: {
    paddingLeft: 20,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementCardDisabled: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  achievementTitleDisabled: {
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  tabsSection: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#0EA5E9',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  activeTabButtonText: {
    color: '#0EA5E9',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  travelLogsGrid: {
    padding: 20,
  },
  travelLogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  travelLogImage: {
    width: '100%',
    height: 200,
  },
  travelLogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  travelLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  countryName: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  travelDate: {
    fontSize: 12,
    color: '#CBD5E1',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  travelLogContent: {
    padding: 16,
  },
  travelLogDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  travelLogActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  likedText: {
    color: '#EF4444',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  createButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollContent: {
    marginTop: 72,
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    top: '15%',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  modalCancelButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  signOutModalContent: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  signOutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signOutModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Bold',
  },
  signOutModalMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  signOutModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  signOutCancelButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutCancelText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  signOutConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutConfirmButtonDisabled: {
    opacity: 0.7,
  },
  signOutConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  signOutLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});