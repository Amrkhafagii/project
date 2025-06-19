import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { X, Package, Truck, CheckCircle } from 'lucide-react-native';
import { Colors } from '@/constants';

interface NotificationBannerProps {
  notification: {
    id: string;
    type: 'order_update' | 'delivery' | 'promotion' | 'general';
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
  };
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function NotificationBanner({ 
  notification, 
  onDismiss, 
  autoHide = true, 
  duration = 5000 
}: NotificationBannerProps) {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'order_update':
        return <Package size={20} color={Colors.white} />;
      case 'delivery':
        return <Truck size={20} color={Colors.white} />;
      case 'promotion':
        return <CheckCircle size={20} color={Colors.white} />;
      default:
        return <CheckCircle size={20} color={Colors.white} />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'order_update':
        return Colors.customer;
      case 'delivery':
        return Colors.warning;
      case 'promotion':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: slideAnim }],
          opacity,
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>

        <View style={styles.actions}>
          {notification.actionText && notification.onAction && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={notification.onAction}
            >
              <Text style={styles.actionText}>{notification.actionText}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={handleDismiss}
          >
            <X size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  dismissButton: {
    padding: 4,
  },
});
