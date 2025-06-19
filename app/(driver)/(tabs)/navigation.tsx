import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
  Navigation as NavigationIcon,
  MapPin,
  Clock,
  Zap,
  AlertTriangle,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import { mapsService } from '@/services/maps/mapsService';
import { Location, ETAUpdate, GPSAccuracy } from '@/types/maps';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Mock Google Maps API Key - In production, this should be in environment variables
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

interface ActiveDelivery {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: Location & { address: string };
  deliveryLocation: Location & { address: string };
  status: 'pickup' | 'delivery';
}

export default function NavigationScreen() {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<GPSAccuracy | null>(null);
  const [eta, setEta] = useState<ETAUpdate | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock active delivery
  const [activeDelivery] = useState<ActiveDelivery>({
    id: '1',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 123-4567',
    pickupLocation: {
      latitude: 40.7580,
      longitude: -73.9855,
      address: 'Green Bowl Kitchen, 123 Health St',
    },
    deliveryLocation: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: '456 Wellness Ave, Apt 2B',
    },
    status: 'pickup',
  });

  useEffect(() => {
    initializeNavigation();
    return () => {
      mapsService.cleanup();
    };
  }, []);

  const initializeNavigation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permissions
      const hasPermission = await mapsService.requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permission is required for navigation');
      }

      // Get current location
      const location = await mapsService.getCurrentLocation();
      setCurrentLocation(location);
      setGpsAccuracy({
        accuracy: location.accuracy,
        timestamp: Date.now(),
        isHighAccuracy: location.accuracy < 10,
      });

      // Start location tracking
      mapsService.startLocationTracking(
        (locationUpdate) => {
          setCurrentLocation(locationUpdate);
          setGpsAccuracy(locationUpdate);
        },
        (error) => {
          setError(error);
        }
      );

      setLoading(false);
    } catch (error) {
      console.error('Navigation initialization error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize navigation');
      setLoading(false);
    }
  };

  const startNavigation = async () => {
    if (!currentLocation || !activeDelivery) return;

    try {
      setIsNavigating(true);
      const destination = activeDelivery.status === 'pickup' 
        ? activeDelivery.pickupLocation 
        : activeDelivery.deliveryLocation;

      // Get directions
      await mapsService.getDirections(currentLocation, destination);

      // Start ETA updates
      mapsService.startETAUpdates(
        destination,
        (etaUpdate) => {
          setEta(etaUpdate);
        },
        (error) => {
          console.error('ETA update error:', error);
        }
      );

      // Center map on route
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          [currentLocation, destination],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }

      Alert.alert('Navigation Started', 'Follow the route to your destination');
    } catch (error) {
      console.error('Navigation start error:', error);
      Alert.alert('Navigation Error', 'Unable to start navigation');
      setIsNavigating(false);
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setEta(null);
    mapsService.stopETAUpdates();
    Alert.alert('Navigation Stopped', 'You can restart navigation anytime');
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  const formatETA = (eta: ETAUpdate) => {
    const minutes = Math.ceil(eta.remainingTime / 60);
    const arrivalTime = eta.estimatedArrival.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${minutes} min • ${arrivalTime}`;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 5) return '#10B981'; // High accuracy - green
    if (accuracy < 15) return '#F59E0B'; // Medium accuracy - yellow
    return '#EF4444'; // Low accuracy - red
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Initializing Navigation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Navigation Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeNavigation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsTraffic={true}
          initialRegion={
            currentLocation
              ? {
                  ...currentLocation,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                }
              : undefined
          }
        >
          {/* Current Location Marker */}
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="Your Location"
              pinColor="#F97316"
            />
          )}

          {/* Pickup Location Marker */}
          <Marker
            coordinate={activeDelivery.pickupLocation}
            title="Pickup Location"
            description={activeDelivery.pickupLocation.address}
            pinColor="#EF4444"
          />

          {/* Delivery Location Marker */}
          <Marker
            coordinate={activeDelivery.deliveryLocation}
            title="Delivery Location"
            description={activeDelivery.deliveryLocation.address}
            pinColor="#10B981"
          />

          {/* Directions */}
          {currentLocation && isNavigating && (
            <MapViewDirections
              origin={currentLocation}
              destination={
                activeDelivery.status === 'pickup'
                  ? activeDelivery.pickupLocation
                  : activeDelivery.deliveryLocation
              }
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor="#F97316"
              optimizeWaypoints={true}
              onError={(error) => {
                console.error('Directions error:', error);
                setIsOffline(true);
              }}
            />
          )}
        </MapView>

        {/* GPS Accuracy Indicator */}
        {gpsAccuracy && (
          <View style={[styles.accuracyIndicator, { backgroundColor: getAccuracyColor(gpsAccuracy.accuracy) }]}>
            <Text style={styles.accuracyText}>
              GPS: {gpsAccuracy.accuracy.toFixed(0)}m
            </Text>
          </View>
        )}

        {/* Center Location Button */}
        <TouchableOpacity style={styles.centerButton} onPress={centerOnCurrentLocation}>
          <NavigationIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Offline Indicator */}
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <AlertTriangle size={16} color="#FFFFFF" />
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}
      </View>

      {/* Navigation Info Panel */}
      <View style={styles.infoPanel}>
        {/* ETA Information */}
        {eta && isNavigating && (
          <View style={styles.etaContainer}>
            <View style={styles.etaMain}>
              <Clock size={20} color="#F97316" />
              <Text style={styles.etaTime}>{formatETA(eta)}</Text>
            </View>
            <Text style={styles.etaDistance}>
              {formatDistance(eta.remainingDistance)} remaining
            </Text>
            {eta.trafficDelay > 60 && (
              <Text style={styles.trafficDelay}>
                +{Math.ceil(eta.trafficDelay / 60)} min traffic delay
              </Text>
            )}
          </View>
        )}

        {/* Destination Info */}
        <View style={styles.destinationContainer}>
          <View style={styles.destinationHeader}>
            <MapPin size={20} color={activeDelivery.status === 'pickup' ? '#EF4444' : '#10B981'} />
            <Text style={styles.destinationTitle}>
              {activeDelivery.status === 'pickup' ? 'Pickup from' : 'Deliver to'}
            </Text>
          </View>
          <Text style={styles.destinationAddress}>
            {activeDelivery.status === 'pickup'
              ? activeDelivery.pickupLocation.address
              : activeDelivery.deliveryLocation.address}
          </Text>
          <Text style={styles.customerName}>{activeDelivery.customerName}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <Phone size={16} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton}>
            <MessageCircle size={16} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Message</Text>
          </TouchableOpacity>

          {!isNavigating ? (
            <TouchableOpacity style={styles.navigationButton} onPress={startNavigation}>
              <NavigationIcon size={16} color="#FFFFFF" />
              <Text style={styles.navigationButtonText}>Start Navigation</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopNavigation}>
              <Text style={styles.stopButtonText}>Stop Navigation</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  accuracyIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  accuracyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  centerButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F97316',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  offlineIndicator: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  etaContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  etaMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  etaDistance: {
    fontSize: 14,
    color: '#6B7280',
  },
  trafficDelay: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
  destinationContainer: {
    marginBottom: 20,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  destinationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  navigationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 12,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  stopButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
