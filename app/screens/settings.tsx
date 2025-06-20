import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
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

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      messages: true,
      likes: false,
      comments: true,
      follows: true,
    },
    privacy: {
      showLocation: true,
      showOnlineStatus: true,
      allowMessages: 'everyone',
    },
    safety: {
      shareLocation: false,
      emergencyContacts: [],
    },
    app: {
      darkMode: false,
      language: 'en',
      autoDownload: true,
    },
  });

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storageService.getUserPreferences();
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await storageService.setUserPreferences(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggle = (section: string, key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // Simulate password change
    Alert.alert('Success', 'Password changed successfully');
    setChangePasswordVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Simulate account deletion
            await storageService.clear();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'person-outline',
          type: 'navigation',
          onPress: () => router.push('/(tabs)/profile'),
        },
        {
          id: 'change-password',
          title: 'Change Password',
          subtitle: 'Update your account password',
          icon: 'key-outline',
          type: 'action',
          onPress: () => setChangePasswordVisible(true),
        },
        {
          id: 'premium',
          title: 'Premium Subscription',
          subtitle: 'Manage your premium features',
          icon: 'trophy-outline',
          type: 'navigation',
          color: '#FFD700',
          onPress: () => router.push('/premium'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          icon: 'notifications-outline',
          type: 'toggle',
          value: settings.notifications.push,
          onToggle: (value) => handleToggle('notifications', 'push', value),
        },
        {
          id: 'email-notifications',
          title: 'Email Notifications',
          subtitle: 'Receive updates via email',
          icon: 'mail-outline',
          type: 'toggle',
          value: settings.notifications.email,
          onToggle: (value) => handleToggle('notifications', 'email', value),
        },
        {
          id: 'message-notifications',
          title: 'Message Notifications',
          subtitle: 'Get notified of new messages',
          icon: 'chatbubble-outline',
          type: 'toggle',
          value: settings.notifications.messages,
          onToggle: (value) => handleToggle('notifications', 'messages', value),
        },
        {
          id: 'like-notifications',
          title: 'Like Notifications',
          subtitle: 'Get notified when someone likes your posts',
          icon: 'heart-outline',
          type: 'toggle',
          value: settings.notifications.likes,
          onToggle: (value) => handleToggle('notifications', 'likes', value),
        },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        {
          id: 'show-location',
          title: 'Show Location',
          subtitle: 'Display your location in posts',
          icon: 'location-outline',
          type: 'toggle',
          value: settings.privacy.showLocation,
          onToggle: (value) => handleToggle('privacy', 'showLocation', value),
        },
        {
          id: 'online-status',
          title: 'Show Online Status',
          subtitle: 'Let others see when you\'re online',
          icon: 'radio-outline',
          type: 'toggle',
          value: settings.privacy.showOnlineStatus,
          onToggle: (value) => handleToggle('privacy', 'showOnlineStatus', value),
        },
        {
          id: 'share-location',
          title: 'Emergency Location Sharing',
          subtitle: 'Share location with emergency contacts',
          icon: 'shield-outline',
          type: 'toggle',
          value: settings.safety.shareLocation,
          onToggle: (value) => handleToggle('safety', 'shareLocation', value),
        },
        {
          id: 'blocked-users',
          title: 'Blocked Users',
          subtitle: 'Manage blocked accounts',
          icon: 'ban-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon'),
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          icon: 'moon-outline',
          type: 'toggle',
          value: settings.app.darkMode,
          onToggle: (value) => handleToggle('app', 'darkMode', value),
        },
        {
          id: 'auto-download',
          title: 'Auto-download Media',
          subtitle: 'Automatically download images and videos',
          icon: 'download-outline',
          type: 'toggle',
          value: settings.app.autoDownload,
          onToggle: (value) => handleToggle('app', 'autoDownload', value),
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English',
          icon: 'language-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Multiple languages will be available soon'),
        },
        {
          id: 'storage',
          title: 'Storage & Data',
          subtitle: 'Manage app storage',
          icon: 'server-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Storage management will be available soon'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: 'help-circle-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Help Center', 'Visit our help center at help.solojourn.com'),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: 'chatbubble-ellipses-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Feedback', 'Send feedback to feedback@solojourn.com'),
        },
        {
          id: 'about',
          title: 'About SoloJourn',
          subtitle: 'Version 1.0.0',
          icon: 'information-circle-outline',
          type: 'navigation',
          onPress: () => Alert.alert('About', 'SoloJourn v1.0.0\nYour companion for safe solo travel'),
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          icon: 'document-text-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Terms', 'View terms at solojourn.com/terms'),
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          icon: 'lock-closed-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Privacy', 'View privacy policy at solojourn.com/privacy'),
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'sign-out',
          title: 'Sign Out',
          icon: 'log-out-outline',
          type: 'action',
          color: '#EF4444',
          onPress: handleSignOut,
        },
        {
          id: 'delete-account',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          icon: 'trash-outline',
          type: 'action',
          color: '#EF4444',
          destructive: true,
          onPress: () => setDeleteAccountVisible(true),
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingsItem, item.destructive && styles.destructiveItem]}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.iconContainer, item.color && { backgroundColor: `${item.color}15` }]}>
            <Ionicons 
              name={item.icon as any} 
              size={20} 
              color={item.color || (item.destructive ? '#EF4444' : '#64748B')} 
            />
          </View>
          <View style={styles.itemText}>
            <Text style={[styles.itemTitle, item.destructive && styles.destructiveText]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <View style={styles.itemRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#E2E8F0', true: '#0EA5E9' }}
              thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
            />
          )}
          {item.type === 'navigation' && (
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingsItem)}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChangePasswordVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setChangePasswordVisible(false)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
            <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.modalButtonGradient}>
              <Text style={styles.modalButtonText}>Change Password</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.modalCancelButton} 
            onPress={() => setChangePasswordVisible(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteAccountVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteAccountVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteAccountVisible(false)} />
        <View style={styles.modalContent}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={32} color="#EF4444" />
            <Text style={styles.modalTitle}>Delete Account</Text>
          </View>
          
          <Text style={styles.warningText}>
            This action cannot be undone. All your data, posts, messages, and account information will be permanently deleted.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Type <Text style={styles.deleteConfirmText}>DELETE</Text> to confirm
            </Text>
            <TextInput
              style={styles.input}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="Type DELETE"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity 
            style={[styles.modalButton, styles.deleteButton]} 
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.modalCancelButton} 
            onPress={() => setDeleteAccountVisible(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Bold',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 20,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-SemiBold',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  destructiveItem: {
    borderBottomColor: '#FEE2E2',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Medium',
  },
  destructiveText: {
    color: '#EF4444',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
  },
  itemRight: {
    marginLeft: 12,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    top: '20%',
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
  warningHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
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
  deleteConfirmText: {
    fontWeight: '700',
    color: '#EF4444',
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
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 16,
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
});