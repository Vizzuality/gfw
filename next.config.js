require('dotenv').config();

const path = require('path');
const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');
const withSass = require('@zeit/next-sass');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const Dotenv = require('dotenv-webpack');

const nextConfig = {
  distDir: 'build',
  webpack: (config) => {
    config.resolve.alias.components = path.join(__dirname, 'components');
    config.resolve.alias.lib = path.join(__dirname, 'lib');
    config.resolve.alias.app = path.join(__dirname, 'app');
    config.resolve.alias.layouts = path.join(__dirname, 'layouts');
    config.resolve.alias.pages = path.join(__dirname, 'pages');
    config.resolve.alias.assets = path.join(__dirname, 'assets');
    config.resolve.alias.analytics = path.join(__dirname, 'analytics');
    config.resolve.alias.services = path.join(__dirname, 'services');
    config.resolve.alias.utils = path.join(__dirname, 'utils');
    config.resolve.alias.providers = path.join(__dirname, 'providers');
    config.resolve.alias.styles = path.join(__dirname, 'styles');
    config.resolve.alias.data = path.join(__dirname, 'data');
    config.plugins = [
      ...config.plugins,
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true,
      }),
    ];

    // mini-css-extract-plugin generates a warning when importing css as modules
    // as we scope manually we can ignore this warning: https://github.com/zeit/next-plugins/issues/506#issuecomment-589269285
    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
      })
    );

    return config;
  },
};

module.exports = withPlugins(
  [[withSass], [optimizedImages], [withBundleAnalyzer]],
  nextConfig
);
