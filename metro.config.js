const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Create a custom resolver for web platform
const defaultResolver = defaultConfig.resolver;
const sourceExts = [...defaultConfig.resolver.sourceExts];

// Add web-specific configuration
defaultConfig.resolver = {
  ...defaultResolver,
  sourceExts: process.env.EXPO_TARGET === 'web' 
    ? ['web.js', 'web.jsx', 'web.ts', 'web.tsx', ...sourceExts] 
    : sourceExts,
  extraNodeModules: {
    ...defaultResolver.extraNodeModules,
    // When building for web, replace problematic native modules with mocks
    ...(process.env.EXPO_TARGET === 'web' ? {
      'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, './web-mocks/empty.js'),
    } : {}),
  },
};

module.exports = defaultConfig;
