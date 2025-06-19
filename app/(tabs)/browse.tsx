import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MapPin } from 'lucide-react-native';
import { RestaurantCard } from '@/features/customer/components/RestaurantCard';
import { MealCard } from '@/features/customer/components/MealCard';

export default function BrowseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'restaurants' | 'meals'>('restaurants');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Mock data
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
      name: 'Macro Masters',
      description: 'Precise macro-counted meals for serious athletes',
      rating: 4.9,
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
      name: 'Protein-Packed Quinoa Bowl',
      description: 'Quinoa with black beans, grilled vegetables, and tahini dressing',
      price: 14.99,
      rating: 4.5,
      prepTime: 15,
      calories: 380,
      imageUrl: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
    },
    {
      id: '4',
      name: 'Beef & Sweet Potato Stack',
      description: 'Lean beef with roasted sweet potato and green beans',
      price: 19.99,
      rating: 4.8,
      prepTime: 30,
      calories: 520,
      imageUrl: 'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg',
    },
  ];

  const filterOptions = ['Nearby', 'Highest Rated', 'Low Calorie', 'High Protein', 'Vegetarian', 'Quick Prep'];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Browse</Text>
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
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterPill,
              selectedFilters.includes(filter) && styles.filterPillActive,
            ]}
            onPress={() => toggleFilter(filter)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFilters.includes(filter) && styles.filterPillTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'restaurants' && styles.tabActive]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'restaurants' && styles.tabTextActive,
            ]}
          >
            Restaurants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'meals' && styles.tabActive]}
          onPress={() => setActiveTab('meals')}
        >
          <Text
            style={[styles.tabText, activeTab === 'meals' && styles.tabTextActive]}
          >
            Meals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'restaurants' ? (
          <>
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                {...restaurant}
                onPress={() => {
                  Alert.alert('Restaurant', `Opening ${restaurant.name}`);
                }}
              />
            ))}
          </>
        ) : (
          <>
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
          </>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterPillText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
