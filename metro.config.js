const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver alias for native modules on web
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native/Libraries/Utilities/codegenNativeCommands': require.resolve('./metro-shims/codegenNativeCommands.js'),
};

// Ensure web platform is properly configured
config.resolver.platforms = ['web', 'ios', 'android', 'native'];

module.exports = config;