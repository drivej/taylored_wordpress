
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // entry: './src/stock_check/index.tsx',
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: { comments: false },
          compress: true,
          mangle: false
        },
        extractComments: false
      })
    ]
  },
  output: {
    publicPath: '/',
    // filename: `ci_stock_check.js`,
    path: path.resolve(__dirname, '../dist'),
    // library: 'ci_stock_check',
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
};
