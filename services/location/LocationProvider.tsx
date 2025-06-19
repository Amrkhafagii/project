import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Location as LocationType } from '@/types/common';

interface LocationContextType {
  currentLocation: LocationType | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationType>;
  geocodeAddress: (address: string) => Promise<LocationType>;
  reverseGeocode: (location: LocationType) => Promise<string>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async (): Promise<LocationType> => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const locationData: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      setCurrentLocation(locationData);
      return locationData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address: string): Promise<LocationType> => {
    try {
      const results = await Location.geocodeAsync(address);
      if (results.length === 0) {
        throw new Error('Address not found');
      }

      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
        address
      };
    } catch (err) {
      throw new Error('Failed to geocode address');
    }
  };

  const reverseGeocode = async (location: LocationType): Promise<string> => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude
      });

      if (results.length === 0) {
        throw new Error('Address not found');
      }

      const result = results[0];
      return `${result.street} ${result.streetNumber}, ${result.city}, ${result.region} ${result.postalCode}`;
    } catch (err) {
      throw new Error('Failed to reverse geocode location');
    }
  };

  const value: LocationContextType = {
    currentLocation,
    loading,
    error,
    requestLocation,
    geocodeAddress,
    reverseGeocode
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
