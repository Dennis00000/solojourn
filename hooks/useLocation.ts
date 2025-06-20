import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { socketService } from '../services/socket';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Request location permissions
  const requestPermissions = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        setError('Location permission denied');
        return false;
      }
      
      return true;
    } catch (err) {
      setError('Failed to request location permissions');
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return null;
    }

    setLoading(true);
    setError(null);

    try {
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationData: LocationData = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy || undefined,
        timestamp: locationResult.timestamp,
      };

      setLocation(locationData);
      return locationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [hasPermission, requestPermissions]);

  // Start sharing location
  const startLocationSharing = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    setIsSharing(true);
    
    try {
      // Get initial location
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        socketService.shareLocation(currentLocation);
      }

      // Start watching location changes
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 50, // Update when moved 50 meters
        },
        (locationResult) => {
          const locationData: LocationData = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
            accuracy: locationResult.coords.accuracy || undefined,
            timestamp: locationResult.timestamp,
          };

          setLocation(locationData);
          socketService.shareLocation(locationData);
        }
      );

      return subscription;
    } catch (err) {
      setError('Failed to start location sharing');
      setIsSharing(false);
      return null;
    }
  }, [hasPermission, requestPermissions, getCurrentLocation]);

  // Stop sharing location
  const stopLocationSharing = useCallback(() => {
    setIsSharing(false);
    // The subscription should be managed by the caller
  }, []);

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = useCallback(async (latitude: number, longitude: number) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const address = addresses[0];
        return {
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          formattedAddress: `${address.street ? address.street + ', ' : ''}${address.city}, ${address.region}, ${address.country}`,
        };
      }
      return null;
    } catch (err) {
      console.error('Error getting address:', err);
      return null;
    }
  }, []);

  // Check if location services are enabled
  const checkLocationServices = useCallback(async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setError('Location services are disabled');
      }
      return enabled;
    } catch (err) {
      setError('Failed to check location services');
      return false;
    }
  }, []);

  // Initialize permissions check
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    checkPermissions();
    checkLocationServices();
  }, [checkLocationServices]);

  return {
    location,
    loading,
    error,
    hasPermission,
    isSharing,
    getCurrentLocation,
    startLocationSharing,
    stopLocationSharing,
    getAddressFromCoordinates,
    requestPermissions,
    checkLocationServices,
  };
}