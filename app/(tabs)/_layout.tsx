import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#374151',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 34,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.95)' : '#FFFFFF',
          borderRadius: 32,
          borderTopWidth: 0,
          height: 80,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 32,
          elevation: 20,
          overflow: 'hidden',
          paddingHorizontal: 24,
          paddingVertical: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 16,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
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
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={28} 
                color={color}
                style={[styles.icon, focused && styles.activeIcon]}
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
              <Ionicons 
                name={focused ? "search" : "search-outline"} 
                size={28} 
                color={color}
                style={[styles.icon, focused && styles.activeIcon]}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons 
                name={focused ? "shield" : "shield-outline"} 
                size={28} 
                color={color}
                style={[styles.icon, focused && styles.activeIcon]}
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
              <Ionicons 
                name={focused ? "person-circle" : "person-circle-outline"} 
                size={28} 
                color={color}
                style={[styles.icon, focused && styles.activeIcon]}
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(55, 65, 81, 0.06)',
    transform: [{ scale: 1.05 }],
  },
  icon: {
    opacity: 0.8,
  },
  activeIcon: {
    opacity: 1,
  },
});