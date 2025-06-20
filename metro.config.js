const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver alias for react-native-maps on web
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-maps': require.resolve('./metro-shims/react-native-maps-mock.js'),
};

// Ensure web platform is properly configured
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

module.exports = config;