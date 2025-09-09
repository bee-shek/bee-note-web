const withTM = require('next-transpile-modules')([
  'react-native',
  'react-native-paper',
  '@react-navigation/native',
  '@react-navigation/stack',
  '@react-native-async-storage/async-storage',
]);

module.exports = withTM({
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    return config;
  },
});
