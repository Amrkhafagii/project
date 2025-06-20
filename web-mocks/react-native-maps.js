import React from 'react';
import { View, Text } from 'react-native';

// Mock implementation of MapView
const MapView = ({ style, children, ...props }) => {
  return (
    <View 
      style={[
        { 
          backgroundColor: '#e5e5e5', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 200,
        },
        style
      ]}
      {...props}
    >
      <Text style={{ color: '#666', position: 'absolute' }}>Map View</Text>
      {children}
    </View>
  );
};

// Mock implementation of Marker
const Marker = ({ title, description, coordinate, ...props }) => {
  return (
    <View
      style={{
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 20,
        padding: 8,
      }}
      {...props}
    >
      <Text>📍</Text>
      {title && <Text style={{ fontSize: 10 }}>{title}</Text>}
      }
    </View>
  );
};

// Mock implementation of Polyline
const Polyline = () => <View />;

// Mock implementation of Circle
const Circle = () => <View />;

// Constants
const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = 'default';

// Export all components and constants
export default {
  default: MapView,
  MapView,
  Marker,
  Polyline,
  Circle,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
};

// Also export them individually
export {
  MapView,
  Marker,
  Polyline,
  Circle,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
};