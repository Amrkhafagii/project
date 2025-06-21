import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Truck, MapPin } from 'lucide-react-native';
import { Colors, Layout } from '@/constants';

interface DriverLocationMapProps {
  driverId?: string;
  customerLocation?: {
    latitude: number;
    longitude: number;
  };
  restaurantLocation?: {
    latitude: number;
    longitude: number;
  };
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number;
}

export function DriverLocationMap({ 
  driverId, 
  customerLocation, 
  restaurantLocation 
}: DriverLocationMapProps) {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: customerLocation?.latitude || 37.78825,
    longitude: customerLocation?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    // Simulate driver location updates
    const mockDriverLocation: DriverLocation = {
      latitude: 37.78925,
      longitude: -122.4344,
      heading: 45,
    };
    
    setDriverLocation(mockDriverLocation);
    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setDriverLocation(prev => {
        if (!prev) return mockDriverLocation;
        
        return {
          ...prev,
          latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
          heading: (prev.heading || 0) + (Math.random() - 0.5) * 10,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [driverId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const routeCoordinates = [
    restaurantLocation || { latitude: 37.7879, longitude: -122.4364 },
    driverLocation || { latitude: 37.78925, longitude: -122.4344 },
    customerLocation || { latitude: 37.78825, longitude: -122.4324 },
  ];

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver"
            description="Your delivery driver"
          >
            <View style={styles.driverMarker}>
              <Truck size={24} color={Colors.white} />
            </View>
          </Marker>
        )}

        {/* Restaurant Marker */}
        {restaurantLocation && (
          <Marker
            coordinate={restaurantLocation}
            title="Restaurant"
            description="Pickup location"
          >
            <View style={styles.restaurantMarker}>
              <MapPin size={24} color={Colors.white} />
            </View>
          </Marker>
        )}

        {/* Customer Marker */}
        {customerLocation && (
          <Marker
            coordinate={customerLocation}
            title="Delivery Address"
            description="Your location"
          >
            <View style={styles.customerMarker}>
              <MapPin size={24} color={Colors.white} />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={Colors.primary}
          strokeWidth={3}
          lineDashPattern={[1, 0]}
        />
      </MapView>

      {/* Driver Info Overlay */}
      {driverLocation && (
        <View style={styles.driverInfo}>
          <View style={styles.driverInfoContent}>
            <Truck size={20} color={Colors.primary} />
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>John Doe</Text>
              <Text style={styles.driverStatus}>On the way • 5 min</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  restaurantMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  driverInfo: {
    position: 'absolute',
    bottom: Layout.spacing.xl,
    left: Layout.spacing.md,
    right: Layout.spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverDetails: {
    marginLeft: Layout.spacing.md,
    flex: 1,
  },
  driverName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  driverStatus: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default DriverLocationMap;
