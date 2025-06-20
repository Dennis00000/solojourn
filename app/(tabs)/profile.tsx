import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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
  const [selectedTab, setSelectedTab] = useState<'posts' | 'saved' | 'itineraries'>('posts');
  const [travelLogs, setTravelLogs] = useState<TravelLog[]>(mockTravelLogs);

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
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="pencil" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="settings-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileLinksRow}>
          <TouchableOpacity style={styles.profileLinkButton} onPress={() => router.push('/screens/settings')}>
            <Ionicons name="settings-outline" size={20} color="#0EA5E9" style={{ marginRight: 8 }} />
            <Text style={styles.profileLinkText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileLinkButton} onPress={() => router.push('/screens/itineraries')}>
            <Ionicons name="calendar-outline" size={20} color="#0EA5E9" style={{ marginRight: 8 }} />
            <Text style={styles.profileLinkText}>Itineraries</Text>
          </TouchableOpacity>
        </View>

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
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <Text style={styles.userName}>Emma Chen</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#64748B" />
            <Text style={styles.currentLocation}>Currently in Tokyo, Japan</Text>
          </View>
          
          <Text style={styles.userBio}>
            Solo traveler exploring the world one city at a time 📍 Digital nomad sharing authentic travel experiences and safety tips for fellow solo adventurers ✈️
          </Text>

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
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="chatbubble" size={18} color="#0EA5E9" />
              <Text style={styles.secondaryButtonText}>Message</Text>
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
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#0EA5E9',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  profileLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 16,
  },
  profileLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 8,
  },
  profileLinkText: {
    fontSize: 15,
    color: '#0EA5E9',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
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
    marginTop: 72, // height of header
    flex: 1,
  },
});