const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure resolver to provide web-compatible shims for native-only modules
config.resolver.extraNodeModules = {
  'react-native/Libraries/Utilities/codegenNativeCommands': require.resolve('./metro-shims/codegenNativeCommands.js'),
};

module.exports = config;