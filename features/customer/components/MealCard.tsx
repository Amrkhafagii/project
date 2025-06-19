import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, Clock, Flame, Plus } from 'lucide-react-native';

interface MealCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  prepTime: number;
  calories: number;
  imageUrl: string;
  onPress: () => void;
  onAddToCart: () => void;
}

export function MealCard({
  name,
  description,
  price,
  rating,
  prepTime,
  calories,
  imageUrl,
  onPress,
  onAddToCart,
}: MealCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.metadataText}>{rating}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.metadataText}>{prepTime} min</Text>
          </View>
          <View style={styles.metadataItem}>
            <Flame size={14} color="#EF4444" />
            <Text style={styles.metadataText}>{calories} cal</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
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
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 16,
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
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
