export interface Location {
  latitude: number;
  longitude: number;
}

export interface NavigationRoute {
  distance: number;
  duration: number;
  polyline: string;
  steps: NavigationStep[];
}

export interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: Location;
  endLocation: Location;
  maneuver: string;
}

export interface ETAUpdate {
  estimatedArrival: Date;
  remainingDistance: number;
  remainingTime: number;
  trafficDelay: number;
}

export interface GPSAccuracy {
  accuracy: number;
  timestamp: number;
  isHighAccuracy: boolean;
}
