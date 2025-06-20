import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.85)' : '#FFFFFF',
          borderRadius: 24,
          borderTopWidth: 0,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 12,
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '700',
          fontFamily: 'Inter-Bold',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarBackground: () => (
          <BlurView intensity={40} tint="light" style={{ flex: 1 }} />
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="map" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Safety',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="shield" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person-circle" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
});