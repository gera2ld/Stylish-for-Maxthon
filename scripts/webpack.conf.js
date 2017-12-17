const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const base = require('./webpack.base.conf');
const { IS_DEV, merge } = require('./utils');

const entry = {
  'background/app': 'src/background/app.js',
  'options/app': 'src/options/app.js',
  'popup/app': 'src/popup/app.js',
  injected: 'src/injected/index.js',
};

const targets = [];
module.exports = targets;

targets.push(merge(base, {
  entry,
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      chunks: Object.keys(entry).filter(name => name !== 'injected'),
      minChunks: (m, c) => c >= 2,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'browser',
      chunks: ['common', 'injected'],
      minChunks: (m, c) => c >= 2,
    }),
    new HtmlWebpackPlugin({
      filename: 'background/index.html',
      chunks: ['browser', 'common', 'background/app'],
    }),
    new HtmlWebpackPlugin({
      filename: 'options/index.html',
      template: 'src/options/index.html',
      chunks: ['browser', 'common', 'options/app'],
    }),
    new HtmlWebpackPlugin({
      filename: 'popup/index.html',
      template: 'src/popup/index.html',
      chunks: ['browser', 'common', 'popup/app'],
    }),
    // new FriendlyErrorsPlugin(),
    !IS_DEV && new ExtractTextPlugin('[name].css'),
  ].filter(Boolean),
}));
