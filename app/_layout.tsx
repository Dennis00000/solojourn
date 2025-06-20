import React from 'react';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useSocket } from '@/hooks/useSocket';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  useFrameworkReady();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Initialize socket connection
  useSocket();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    const checkAppState = async () => {
      try {
        const [hasLaunched, userToken] = await Promise.all([
          AsyncStorage.getItem('hasLaunched'),
          AsyncStorage.getItem('userToken'),
        ]);
        
        setIsFirstLaunch(hasLaunched === null);
        setIsAuthenticated(userToken !== null);
      } catch (error) {
        console.error('Error checking app state:', error);
        setIsFirstLaunch(true);
        setIsAuthenticated(false);
      }
    };

    checkAppState();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isFirstLaunch !== null && isAuthenticated !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isFirstLaunch, isAuthenticated]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isFirstLaunch === null || isAuthenticated === null) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isFirstLaunch ? (
        <>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </>
      ) : !isAuthenticated ? (
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      ) : null}
      
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="premium" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppContent />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}