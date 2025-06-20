import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, Clock, MapPin, Heart } from 'lucide-react-native';
import { Colors } from '@/constants';

interface FavoriteCardProps {
  item: {
    id: string;
    name: string;
    image: string;
    restaurantName?: string;
    price?: number;
    rating?: number;
    prepTime?: number;
    isAvailable: boolean;
    lastOrdered?: Date;
  };
  onPress: () => void;
  onToggleFavorite: () => void;
  onOrder?: () => void;
  isFavorited: boolean;
}

export function FavoriteCard({ 
  item, 
  onPress, 
  onToggleFavorite, 
  onOrder,
  isFavorited 
}: FavoriteCardProps) {
  const formatLastOrdered = (date?: Date) => {
    if (!date) return null;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Last ordered yesterday';
    if (diffDays < 7) return `Last ordered ${diffDays} days ago`;
    if (diffDays < 30) return `Last ordered ${Math.ceil(diffDays / 7)} weeks ago`;
    return 'Last ordered over a month ago';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={onToggleFavorite}
        >
          <Heart 
            size={20} 
            color={isFavorited ? Colors.error : Colors.white} 
            fill={isFavorited ? Colors.error : 'transparent'}
          />
        </TouchableOpacity>
        {!item.isAvailable && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        
        {item.restaurantName && (
          <Text style={styles.restaurant}>{item.restaurantName}</Text>
        )}

        <View style={styles.metadata}>
          {item.price && (
            <View style={styles.metaItem}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>${item.price.toFixed(2)}</Text>
            </View>
          )}
          
          {item.rating && (
            <View style={styles.metaItem}>
              <Star size={14} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
          
          {item.prepTime && (
            <View style={styles.metaItem}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{item.prepTime} min</Text>
            </View>
          )}
        </View>

        {item.lastOrdered && (
          <Text style={styles.lastOrdered}>{formatLastOrdered(item.lastOrdered)}</Text>
        )}

        <View style={styles.actions}>
          {item.isAvailable ? (
            <TouchableOpacity 
              style={styles.orderButton} 
              onPress={onOrder}
            >
              <Text style={styles.orderButtonText}>Order Now</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.notifyButton}
              onPress={() => {/* Handle notify when available */}}
            >
              <Text style={styles.notifyButtonText}>Notify When Available</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  restaurant: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  lastOrdered: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  orderButton: {
    backgroundColor: Colors.customer,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
  },
  orderButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notifyButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifyButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default FavoriteCard;
