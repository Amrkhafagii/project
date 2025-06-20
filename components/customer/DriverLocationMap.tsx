import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Truck, MapPin, Navigation } from 'lucide-react-native';
import { getRealTimeManager } from '@/services/realtime/realTimeManager';
import { Colors, Layout } from '@/constants';

interface DriverLocationMapProps {
  orderId: string;
  driverId?: string;
  restaurantLocation: {
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
  };
}

interface ETA {
  time: number; // minutes
  distance: number; // kilometers
  arrivalTime: Date;
}

export function DriverLocationMap({ 
  orderId,
  driverId,
  restaurantLocation,
  deliveryLocation 
}: DriverLocationMapProps) {
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
    heading?: number;
  } | null>(null);
  
  const [eta, setEta] = useState<ETA | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  
  const mapRef = useRef<MapView>(null);
  
  // Get current location for initial map center
  useEffect(() => {
    (async () => {
      // No need to request permissions for viewing the map
      let currentLocation;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }
      } catch (error) {
        console.log('Error getting current location', error);
      }

      // Set initial map view
      if (mapRef.current) {
        // If we have the driver's location, center on that
        if (driverLocation) {
          mapRef.current.animateToRegion({
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
        // Otherwise center between restaurant and delivery locations
        else {
          mapRef.current.fitToCoordinates(
            [restaurantLocation, deliveryLocation],
            {
              edgePadding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50,
              },
              animated: true,
            }
          );
        }
      }
    })();
  }, []);

  // Set up real-time updates for driver location
  useEffect(() => {
    const realTimeManager = getRealTimeManager();
    let locationSubscription: (() => void) | null = null;
    let connectionSubscription: (() => void) | null = null;
    
    if (realTimeManager && driverId) {
      // Subscribe to driver location updates
      locationSubscription = realTimeManager.subscribe(
        `driver_location_${driverId}`, 
        (data) => {
          setDriverLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            heading: data.heading,
          });
          
          // Update ETA if provided
          if (data.eta) {
            setEta({
              time: data.eta.minutes,
              distance: data.eta.distance,
              arrivalTime: new Date(data.eta.arrivalTime),
            });
          }
          
          // Simulate route coordinates (this would come from the backend in a real app)
          simulateRouteCoordinates(data, deliveryLocation);
        }
      );
      
      // Subscribe to connection status
      connectionSubscription = realTimeManager.subscribe('connection', (data) => {
        setIsConnected(data.status === 'connected');
      });
    }
    
    // Fallback/simulation for testing
    if (!driverId || !realTimeManager) {
      const interval = setInterval(() => {
        // Simulate driver location movement
        setDriverLocation(prev => {
          if (!prev) {
            // Start from restaurant location
            return {
              ...restaurantLocation,
              heading: 0,
            };
          }
          
          // Move toward delivery location
          const step = 0.0001;
          const deltaLat = deliveryLocation.latitude - prev.latitude;
          const deltaLng = deliveryLocation.longitude - prev.longitude;
          const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
          
          // If very close to destination, stop moving
          if (distance < 0.0003) {
            return prev;
          }
          
          // Calculate heading in degrees (0 = North, 90 = East, etc.)
          const heading = Math.atan2(deltaLng, deltaLat) * 180 / Math.PI;
          
          // Update position by moving toward delivery location
          return {
            latitude: prev.latitude + (deltaLat / distance) * step,
            longitude: prev.longitude + (deltaLng / distance) * step,
            heading,
          };
        });
        
        // Update ETA - simulated calculation
        setEta(prev => {
          if (!prev) {
            return {
              time: 15, // 15 minutes
              distance: 3.2, // 3.2 km
              arrivalTime: new Date(Date.now() + 15 * 60000),
            };
          }
          
          // Decrease time and distance
          return {
            time: Math.max(0, prev.time - 0.5),
            distance: Math.max(0, prev.distance - 0.1),
            arrivalTime: new Date(Date.now() + Math.max(0, prev.time - 0.5) * 60000),
          };
        });
      }, 3000);
      
      return () => clearInterval(interval);
    }
    
    return () => {
      if (locationSubscription) locationSubscription();
      if (connectionSubscription) connectionSubscription();
    };
  }, [driverId, orderId]);
  
  // Update map view when driver location changes
  useEffect(() => {
    if (driverLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [driverLocation]);
  
  // Simulate route coordinates based on driver location and destination
  const simulateRouteCoordinates = (driverLoc: any, destination: any) => {
    // In a real app, you would get the actual route from a routing service
    const numPoints = 10;
    const deltaLat = (destination.latitude - driverLoc.latitude) / numPoints;
    const deltaLng = (destination.longitude - driverLoc.longitude) / numPoints;
    
    const newCoords = [];
    newCoords.push({
      latitude: driverLoc.latitude,
      longitude: driverLoc.longitude,
    });
    
    for (let i = 1; i <= numPoints; i++) {
      // Add some randomness to make it look more natural
      const jitter = (Math.random() - 0.5) * 0.0002;
      
      newCoords.push({
        latitude: driverLoc.latitude + (deltaLat * i) + jitter,
        longitude: driverLoc.longitude + (deltaLng * i) + jitter,
      });
    }
    
    setRouteCoordinates(newCoords);
  };
  
  const formatETA = (eta: ETA | null) => {
    if (!eta) return 'Calculating...';
    
    const minutes = Math.round(eta.time);
    const km = eta.distance.toFixed(1);
    
    return `${minutes} min (${km} km)`;
  };
  
  const formatArrivalTime = (date: Date | undefined) => {
    if (!date) return '';
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: (restaurantLocation.latitude + deliveryLocation.latitude) / 2,
            longitude: (restaurantLocation.longitude + deliveryLocation.longitude) / 2,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={false}
        >
          {/* Restaurant Marker */}
          <Marker
            coordinate={restaurantLocation}
            title="Restaurant"
            description="Pickup location"
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerCircle, { backgroundColor: Colors.warning }]}>
                <MapPin size={20} color={Colors.white} />
              </View>
              <Text style={styles.markerLabel}>Pickup</Text>
            </View>
          </Marker>
          
          {/* Delivery Marker */}
          <Marker
            coordinate={deliveryLocation}
            title="Delivery"
            description="Delivery location"
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerCircle, { backgroundColor: Colors.success }]}>
                <MapPin size={20} color={Colors.white} />
              </View>
              <Text style={styles.markerLabel}>Delivery</Text>
            </View>
          </Marker>
          
          {/* Driver Marker */}
          {driverLocation && (
            <Marker
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
              title="Driver"
              description="Your driver's location"
              rotation={driverLocation.heading}
            >
              <View style={styles.driverMarker}>
                <Truck size={24} color={Colors.white} />
              </View>
            </Marker>
          )}
          
          {/* Route line */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor={Colors.primary}
            />
          )}
        </MapView>
        
        {!isConnected && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>
              Offline - Location updates paused
            </Text>
          </View>
        )}
        
        {/* ETA Overlay */}
        {driverLocation && eta && (
          <View style={styles.etaContainer}>
            <View style={styles.etaContent}>
              <View style={styles.etaTimeContainer}>
                <Navigation size={20} color={Colors.primary} />
                <Text style={styles.etaText}>
                  ETA: {formatETA(eta)}
                </Text>
              </View>
              <Text style={styles.arrivalText}>
                Arriving at approximately {formatArrivalTime(eta?.arrivalTime)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  offlineIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  etaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  etaContent: {
    alignItems: 'center',
  },
  etaTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  etaText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  arrivalText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default DriverLocationMap;
