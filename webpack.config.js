const webpack = require('webpack'); //to access built-in plugins
const path = require('path');

const config = {
  entry: ['babel-polyfill', './src/index.js', './src/module/index.js'],
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },
  resolve: {
    modules: ['node_modules', 'src']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};

module.exports = config;
