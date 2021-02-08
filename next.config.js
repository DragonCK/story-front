const withOptimizedImage = require('next-optimized-images');
const withImages = require('next-images');
const path = require('path');

module.exports = withImages(
  withOptimizedImage({
    distDir: './dist/.next',
    webpack(config) {
      const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });

      config.resolve.plugins = [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        }),
      ];

      return config;
    },
  })
);
