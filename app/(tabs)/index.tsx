import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Search, Star, Flame } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext'
import { RestaurantCard } from '@/features/customer/components/RestaurantCard';
import { MealCard } from '@/features/customer/components/MealCard';
import { getCurrentLocation } from '@/services/location/locationService';

export default function HomeScreen() {
  const { user } = useAuth();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your location');
    }
  };

  // Mock data for demonstration
  const featuredRestaurants = [
    {
      id: '1',
      name: 'Green Bowl Kitchen',
      description: 'Fresh, organic meals for fitness enthusiasts',
      rating: 4.8,
      totalReviews: 342,
      distance: 1.2,
      imageUrl: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    },
    {
      id: '2',
      name: 'Protein Palace',
      description: 'High-protein meals for muscle building',
      rating: 4.6,
      totalReviews: 218,
      distance: 0.8,
      imageUrl: 'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg',
    },
  ];

  const featuredMeals = [
    {
      id: '1',
      name: 'Grilled Salmon Power Bowl',
      description: 'Atlantic salmon with quinoa, avocado, and steamed vegetables',
      price: 18.99,
      rating: 4.9,
      prepTime: 25,
      calories: 485,
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    },
    {
      id: '2',
      name: 'Lean Chicken Mediterranean',
      description: 'Grilled chicken breast with Mediterranean vegetables and brown rice',
      price: 16.50,
      rating: 4.7,
      prepTime: 20,
      calories: 420,
      imageUrl: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.location}>
                {location ? 'Current Location' : 'Enable location'}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for meals or restaurants"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#6B7280"
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Flame size={24} color="#EF4444" />
            <Text style={styles.statNumber}>1,850</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statCard}>
            <MapPin size={24} color="#10B981" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Nearby</Text>
          </View>
        </View>

        {/* Featured Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Restaurants</Text>
            <TouchableOpacity onPress={() => router.push('/browse')}>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              {...restaurant}
              onPress={() => {
                // Navigate to restaurant details
                Alert.alert('Restaurant', `Opening ${restaurant.name}`);
              }}
            />
          ))}
        </View>

        {/* Featured Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Meals</Text>
            <TouchableOpacity onPress={() => router.push('/browse')}>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              {...meal}
              onPress={() => {
                Alert.alert('Meal Details', `Viewing ${meal.name}`);
              }}
              onAddToCart={() => {
                Alert.alert('Added to Cart', `${meal.name} added to your cart`);
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionLink: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
});
