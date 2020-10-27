const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src.js',
  plugins: [new webpack.ProgressPlugin()],
  devtool: false,
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [],
      loader: 'babel-loader'
    }]
  },

  optimization: {
    minimizer: [new TerserPlugin()],
    splitChunks: false
  }
}