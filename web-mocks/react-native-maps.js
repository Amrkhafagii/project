// Mock implementation of react-native-maps for web platform
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Mock MapView component
export const MapView = ({ children, style, ...props }) => {
  return (
    <View style={[styles.mapContainer, style]} {...props}>
      <Text style={styles.mapText}>Map View (Web)</Text>
      {children}
    </View>
  );
};

// Mock Marker component
export const Marker = ({ title, description, coordinate, ...props }) => {
  return (
    <View style={styles.marker}>
      <Text style={styles.markerText}>📍</Text>
      {title && <Text style={styles.markerTitle}>{title}</Text>}
    </View>
  );
};

// Mock Polyline component
export const Polyline = ({ coordinates, ...props }) => {
  return <View style={styles.polyline} />;
};

// Mock Circle component
export const Circle = ({ center, radius, ...props }) => {
  return <View style={styles.circle} />;
};

// Mock constants
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  mapText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 20,
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  polyline: {
    height: 2,
    backgroundColor: '#007AFF',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});

export default MapView;