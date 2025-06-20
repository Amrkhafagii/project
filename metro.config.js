const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions if needed
config.resolver.sourceExts.push('cjs');

// Ensure proper module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
