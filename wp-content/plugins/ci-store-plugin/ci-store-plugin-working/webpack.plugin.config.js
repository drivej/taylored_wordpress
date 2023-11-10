// const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
// const dotenv = require('dotenv');
// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    index: './src/wordpress-plugin.tsx'
    // index: ['webpack-hot-middleware/client', './src/wordpress-plugin.tsx']
  },
  watch: true,
  devServer: {
    // allowedHosts: ['http://tayloredlocal.local/'],
    // open: true,
    hot: false,
    historyApiFallback: {
      disableDotRule: true
    },
    devMiddleware: {
      writeToDisk: true
    }
    // proxy: {
    //   '/': {
    //     target: 'http://tayloredlocal.local/',
    //     changeOrigin: true
    //   }
    // }
  },
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
      // {
      //   test: /\.ts(x?)$/,
      //   exclude: /node_modules/,
      //   use: ['babel-loader']
      // },
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        },
        exclude: /node_modules/
      },
      // {
      //   test: /\.(?:js|mjs|cjs)$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: [['@babel/preset-env', { targets: 'defaults' }]]
      //     }
      //   }
      // },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    // new NodePolyfillPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // new HtmlWebpackPlugin({
    //   templateContent: `<html><body><div id="root"></div><script>document.addEventListener("DOMContentLoaded", () => CIStore.render('root'))</script></body></html>`
    // })
    // new webpack.DefinePlugin({
    //   'process.env': JSON.stringify(dotenv.config().parsed),
    //   'process.env.IMAGE_ROOT': JSON.stringify(process.env.IMAGE_ROOT),
    //   'process.env.API_ROOT': JSON.stringify(process.env.API_ROOT),
    //   'process.env.STAGE': JSON.stringify(process.env.STAGE)
    // })
  ],
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
    path: path.resolve(__dirname, '../'),
    library: 'CIStore',
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
};
