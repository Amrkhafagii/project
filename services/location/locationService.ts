import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return { granted: false, canAskAgain: false };
  }
}

export async function getCurrentLocation(): Promise<LocationCoordinates> {
  try {
    const permission = await requestLocationPermission();
    
    if (!permission.granted) {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
}

export async function reverseGeocode(coordinates: LocationCoordinates): Promise<string> {
  try {
    const [address] = await Location.reverseGeocodeAsync(coordinates);
    
    if (address) {
      return `${address.street || ''} ${address.city || ''}, ${address.region || ''}`.trim();
    }
    
    return 'Unknown location';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Unknown location';
  }
}

export function calculateDistance(
  point1: LocationCoordinates,
  point2: LocationCoordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
