import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [hasLaunched, userToken] = await Promise.all([
        AsyncStorage.getItem('hasLaunched'),
        AsyncStorage.getItem('userToken'),
      ]);

      setIsFirstLaunch(hasLaunched === null);
      setIsAuthenticated(userToken !== null);
    } catch (error) {
      setIsFirstLaunch(true);
      setIsAuthenticated(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userName']);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  };

  return {
    isAuthenticated,
    isFirstLaunch,
    signOut,
    markOnboardingComplete,
    checkAuthStatus,
  };
}