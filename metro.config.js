const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure resolver to provide web-compatible shims for native-only modules
config.resolver.alias = {
  'react-native/Libraries/Utilities/codegenNativeCommands': require.resolve('./metro-shims/codegenNativeCommands.js'),
};

// Ensure the resolver can find the shim files
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;