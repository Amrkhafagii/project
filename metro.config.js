const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver to handle react-native-maps
config.resolver.platforms = ['ios', 'android', 'web'];

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Mock react-native-maps for web platform
  'react-native-maps': require.resolve('./web-mocks/react-native-maps.js'),
};

module.exports = config;