const path = require('path')
const webpack = require('webpack')

const javascript = {
  test: /\.(js)$/,
  use: [{
    loader: 'babel-loader',
    options: { presets: ['es2015'] } // this is one way of passing options
  }]
}

const config = {
  entry: path.resolve(__dirname, 'public', 'js', 'modules', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'public', 'js'),
    filename: 'bundle.js'
  },
  module: {
    rules: [javascript]
  }
}

module.exports = config