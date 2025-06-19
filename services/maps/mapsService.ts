import * as Location from 'expo-location';
import { Location as LocationType, NavigationRoute, ETAUpdate, GPSAccuracy } from '@/types/maps';

class MapsService {
  private watchId: Location.LocationSubscription | null = null;
  private etaUpdateInterval: NodeJS.Timeout | null = null;
  private currentRoute: NavigationRoute | null = null;

  async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        return backgroundStatus.status === 'granted';
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationType & { accuracy: number }> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw new Error('Unable to get current location');
    }
  }

  async getDirections(
    origin: LocationType,
    destination: LocationType,
    waypoints?: LocationType[]
  ): Promise<NavigationRoute> {
    try {
      // In a real implementation, you would use Google Directions API
      // This is a mock implementation for demonstration
      const mockRoute: NavigationRoute = {
        distance: this.calculateDistance(origin, destination),
        duration: this.estimateDuration(origin, destination),
        polyline: this.generateMockPolyline(origin, destination),
        steps: this.generateMockSteps(origin, destination),
      };

      this.currentRoute = mockRoute;
      return mockRoute;
    } catch (error) {
      console.error('Error getting directions:', error);
      throw new Error('Unable to get directions');
    }
  }

  startLocationTracking(
    callback: (location: LocationType & GPSAccuracy) => void,
    errorCallback: (error: string) => void
  ): void {
    this.stopLocationTracking();

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        const accuracy = location.coords.accuracy || 0;
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy,
          timestamp: Date.now(),
          isHighAccuracy: accuracy < 10,
        });
      }
    ).then((subscription) => {
      this.watchId = subscription;
    }).catch((error) => {
      errorCallback(`Location tracking failed: ${error.message}`);
    });
  }

  stopLocationTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  startETAUpdates(
    destination: LocationType,
    callback: (eta: ETAUpdate) => void,
    errorCallback: (error: string) => void
  ): void {
    this.stopETAUpdates();

    this.etaUpdateInterval = setInterval(async () => {
      try {
        const currentLocation = await this.getCurrentLocation();
        const eta = await this.calculateETA(currentLocation, destination);
        callback(eta);
      } catch (error) {
        errorCallback(`ETA update failed: ${error}`);
      }
    }, 30000); // Update every 30 seconds
  }

  stopETAUpdates(): void {
    if (this.etaUpdateInterval) {
      clearInterval(this.etaUpdateInterval);
      this.etaUpdateInterval = null;
    }
  }

  private async calculateETA(
    origin: LocationType,
    destination: LocationType
  ): Promise<ETAUpdate> {
    const distance = this.calculateDistance(origin, destination);
    const baseTime = this.estimateDuration(origin, destination);
    const trafficDelay = Math.random() * 300; // Mock traffic delay

    return {
      estimatedArrival: new Date(Date.now() + (baseTime + trafficDelay) * 1000),
      remainingDistance: distance,
      remainingTime: baseTime + trafficDelay,
      trafficDelay,
    };
  }

  private calculateDistance(point1: LocationType, point2: LocationType): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private estimateDuration(point1: LocationType, point2: LocationType): number {
    const distance = this.calculateDistance(point1, point2);
    const averageSpeed = 30; // km/h average city speed
    return (distance / averageSpeed) * 3600; // Convert to seconds
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private generateMockPolyline(origin: LocationType, destination: LocationType): string {
    // In a real implementation, this would come from Google Directions API
    return `mock_polyline_${origin.latitude}_${origin.longitude}_${destination.latitude}_${destination.longitude}`;
  }

  private generateMockSteps(origin: LocationType, destination: LocationType): any[] {
    // Mock navigation steps
    return [
      {
        instruction: 'Head north on Main St',
        distance: 500,
        duration: 60,
        startLocation: origin,
        endLocation: { latitude: origin.latitude + 0.001, longitude: origin.longitude },
        maneuver: 'straight',
      },
      {
        instruction: 'Turn right onto Oak Ave',
        distance: 800,
        duration: 120,
        startLocation: { latitude: origin.latitude + 0.001, longitude: origin.longitude },
        endLocation: destination,
        maneuver: 'turn-right',
      },
    ];
  }

  cleanup(): void {
    this.stopLocationTracking();
    this.stopETAUpdates();
  }
}

export const mapsService = new MapsService();
