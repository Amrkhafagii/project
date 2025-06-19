import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, MapPin, Clock } from 'lucide-react-native';

interface RestaurantCardProps {
  id: string;
  name: string;
  description: string;
  rating: number;
  totalReviews: number;
  distance: number;
  imageUrl: string;
  onPress: () => void;
}

export function RestaurantCard({
  name,
  description,
  rating,
  totalReviews,
  distance,
  imageUrl,
  onPress,
}: RestaurantCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.metadata}>
          <View style={styles.rating}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{rating}</Text>
            <Text style={styles.reviewsText}>({totalReviews})</Text>
          </View>
          <View style={styles.distance}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.distanceText}>{distance} km</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
});
