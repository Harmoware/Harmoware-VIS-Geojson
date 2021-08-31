const resolve = require('path').resolve;
module.exports = {
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: [resolve(__dirname), resolve(__dirname, './src')],
      query: { "presets": ["@babel/react"] }
    }, {
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"]
    }]
  }
};
