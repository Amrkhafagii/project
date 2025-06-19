import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MapPin } from 'lucide-react-native';
import { RestaurantCard } from '@/features/customer/components/RestaurantCard';
import { MealCard } from '@/features/customer/components/MealCard';

export default function BrowseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'healthy', label: 'Healthy' },
    { id: 'protein', label: 'High Protein' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'keto', label: 'Keto' },
  ];

  const restaurants = [
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
    {
      id: '3',
      name: 'Fit Fuel Co.',
      description: 'Balanced nutrition for active lifestyles',
      rating: 4.7,
      totalReviews: 156,
      distance: 2.1,
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    },
  ];

  const meals = [
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
    {
      id: '3',
      name: 'Vegan Buddha Bowl',
      description: 'Colorful mix of roasted vegetables, chickpeas, and tahini dressing',
      price: 14.99,
      rating: 4.5,
      prepTime: 15,
      calories: 380,
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                activeFilter === filter.id && styles.activeFilterTab,
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.id && styles.activeFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Restaurants Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants Near You</Text>
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              {...restaurant}
              onPress={() => {
                Alert.alert('Restaurant', `Opening ${restaurant.name}`);
              }}
            />
          ))}
        </View>

        {/* Meals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Meals</Text>
          {meals.map((meal) => (
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  filterButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 20,
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
  filtersContainer: {
    marginBottom: 24,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterTab: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
});
