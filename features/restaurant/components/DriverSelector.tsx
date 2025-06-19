import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, X, MapPin, Star, Clock, Navigation } from 'lucide-react-native';
import { calculateDistance } from '@/services/location/locationService';

interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  vehicle: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isOnline: boolean;
  currentOrderCount: number;
  distanceToRestaurant?: number;
  estimatedArrival?: string;
}

interface DriverSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectDriver: (driverId: string) => void;
  restaurantLocation: {
    latitude: number;
    longitude: number;
  };
}

export function DriverSelector({
  visible,
  onClose,
  onSelectDriver,
  restaurantLocation,
}: DriverSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    // In a real app, this would fetch nearby available drivers from the server
    const mockDrivers: Driver[] = [
      {
        id: 'driver1',
        name: 'Alex Martinez',
        phoneNumber: '(555) 123-4567',
        rating: 4.8,
        vehicle: 'Car - Toyota Prius',
        location: {
          latitude: 40.7142,
          longitude: -74.0050,
        },
        isOnline: true,
        currentOrderCount: 0,
      },
      {
        id: 'driver2',
        name: 'Sarah Johnson',
        phoneNumber: '(555) 987-6543',
        rating: 4.9,
        vehicle: 'Car - Honda Civic',
        location: {
          latitude: 40.7215,
          longitude: -74.0012,
        },
        isOnline: true,
        currentOrderCount: 1,
      },
      {
        id: 'driver3',
        name: 'Michael Brown',
        phoneNumber: '(555) 456-7890',
        rating: 4.7,
        vehicle: 'Bike',
        location: {
          latitude: 40.7105,
          longitude: -74.0080,
        },
        isOnline: true,
        currentOrderCount: 0,
      },
    ];

    // Calculate distance and ETA for each driver
    const driversWithDistance = mockDrivers.map(driver => {
      const distanceToRestaurant = calculateDistance(
        driver.location.latitude,
        driver.location.longitude,
        restaurantLocation.latitude,
        restaurantLocation.longitude
      );
      
      // Rough ETA calculation (3 minutes per km)
      const etaMinutes = Math.ceil(distanceToRestaurant * 3);
      
      return {
        ...driver,
        distanceToRestaurant: distanceToRestaurant,
        estimatedArrival: `${etaMinutes} min`,
      };
    });
    
    // Sort by distance (closest first)
    driversWithDistance.sort((a, b) => 
      (a.distanceToRestaurant || 0) - (b.distanceToRestaurant || 0)
    );
    
    setDrivers(driversWithDistance);
  }, [restaurantLocation]);

  const filteredDrivers = drivers.filter(
    driver =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      driver.isOnline
  );

  const renderDriverItem = ({ item }: { item: Driver }) => (
    <TouchableOpacity 
      style={styles.driverItem}
      onPress={() => onSelectDriver(item.id)}
    >
      <View style={styles.driverItemHeader}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.name}</Text>
          <View style={styles.driverRating}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.driverRatingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.driverStatus}>
          <View style={styles.driverStatusDot} />
          <Text style={styles.driverStatusText}>Available</Text>
        </View>
      </View>
      
      <View style={styles.driverDetails}>
        <View style={styles.driverDetailItem}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.driverDetailText}>{item.estimatedArrival} away</Text>
        </View>
        <View style={styles.driverDetailItem}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.driverDetailText}>{item.distanceToRestaurant?.toFixed(1)} km</Text>
        </View>
      </View>
      
      <View style={styles.driverVehicleInfo}>
        <Text style={styles.driverVehicleText}>{item.vehicle}</Text>
        <Text style={styles.driverOrderCount}>{item.currentOrderCount} active orders</Text>
      </View>
      
      <TouchableOpacity style={styles.driverSelectButton}>
        <Text style={styles.driverSelectButtonText}>Select Driver</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Driver</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search drivers by name"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          <View style={styles.driversHeader}>
            <Text style={styles.driversHeaderText}>
              {filteredDrivers.length} Drivers Nearby
            </Text>
            <TouchableOpacity style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredDrivers}
            keyExtractor={item => item.id}
            renderItem={renderDriverItem}
            contentContainerStyle={styles.driversList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No available drivers found nearby
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  driversHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  driversHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    padding: 4,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  driversList: {
    padding: 16,
  },
  driverItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  driverItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverRatingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  driverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  driverStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  driverStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  driverDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  driverDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  driverDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  driverVehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverVehicleText: {
    fontSize: 14,
    color: '#4B5563',
  },
  driverOrderCount: {
    fontSize: 14,
    color: '#4B5563',
  },
  driverSelectButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  driverSelectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
