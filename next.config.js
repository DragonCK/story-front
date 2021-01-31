const withOptimizedImage = require('next-optimized-images');
const path = require('path');

module.exports = withOptimizedImage({
  distDir: './dist/.next',
  webpack(config) {
    const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, 'tsconfig.json'),
      }),
    ];

    return config;
  },
});
