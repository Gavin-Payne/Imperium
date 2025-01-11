const path = require('path'); // Only require path once
const HtmlWebpackPlugin = require('html-webpack-plugin'); // This is good, but you're not using it yet

module.exports = {
  mode: 'development', // Set to 'development' for a better development experience
  entry: './src/index.js', 
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // This tells Webpack how to handle .css files
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: './dist',
    hot: true, // Hot module replacement for real-time updates
  },
};
