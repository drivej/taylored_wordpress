// const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
// const dotenv = require('dotenv');
// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    entry: {
      index: './src/import_products/index.tsx'
    },
    watch: true,
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
          options: {
            transpileOnly: true
          },
          exclude: /node_modules/
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        }
      ]
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
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
      filename: `ci-import-products.js`,
      path: path.resolve(__dirname, '../dist'),
      library: 'CIImportProducts',
      libraryTarget: 'umd',
      umdNamedDefine: true
    }
  },
  {
    entry: {
      index: './src/stock_check/index.tsx'
    },
    watch: true,
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
          options: {
            transpileOnly: true
          },
          exclude: /node_modules/
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        }
      ]
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
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
      filename: `ci-stock-check.js`,
      path: path.resolve(__dirname, '../dist'),
      library: 'CIStockCheck',
      libraryTarget: 'umd',
      umdNamedDefine: true
    }
  },
  {
    entry: {
      index: './src/wordpress-plugin.tsx'
    },
    watch: true,
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
          options: {
            transpileOnly: true
          },
          exclude: /node_modules/
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        }
      ]
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
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
      filename: `ci-store-plugin.js`,
      path: path.resolve(__dirname, '../dist'),
      library: 'CIStore',
      libraryTarget: 'umd',
      umdNamedDefine: true
    }
  }
];
