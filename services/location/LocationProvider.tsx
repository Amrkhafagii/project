import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

interface LocationContextType {
  location: Location.LocationObject | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  getCurrentAddress: () => Promise<string | null>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Get address from coordinates
      const addressResult = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResult.length > 0) {
        const addr = addressResult[0];
        const formattedAddress = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
        setAddress(formattedAddress);
      }
    } catch (err) {
      setError('Failed to get location');
      
      // Check if this is an expected web platform error
      const isWebPlatform = Platform.OS === 'web';
      const isPositionUnavailableError = err instanceof Error && 
        err.message.includes('Position update is unavailable');
      
      if (isWebPlatform && isPositionUnavailableError) {
        console.warn('Location error:', err);
      } else {
        console.error('Location error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentAddress = async (): Promise<string | null> => {
    if (!location) {
      await requestLocation();
    }
    return address;
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const value: LocationContextType = {
    location,
    address,
    loading,
    error,
    requestLocation,
    getCurrentAddress,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
