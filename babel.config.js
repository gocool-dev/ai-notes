module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        // Add any additional Babel plugins here
        // For example, if using reanimated:
        // 'react-native-reanimated/plugin',
      ],
    };
  };