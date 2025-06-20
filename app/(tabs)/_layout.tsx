import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Home, Search, MessageCircle, User } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1F2937',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 34,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.9)' : '#FFFFFF',
          borderRadius: 28,
          borderTopWidth: 0,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 16,
          overflow: 'hidden',
          paddingHorizontal: 20,
        },
        tabBarItemStyle: {
          paddingVertical: 12,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />
          )
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Home 
                size={24} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : 'none'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Search 
                size={24} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <MessageCircle 
                size={24} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : 'none'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <User 
                size={24} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : 'none'}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    transition: 'all 0.2s ease',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.08)',
    transform: [{ scale: 1.1 }],
  },
});