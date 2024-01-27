const path = require('path');

module.exports = [
  {
    extends: path.resolve(__dirname, './webpack.base.config.js'),
    entry: './src/stock_check/index.tsx',
    output: {
      filename: `ci_stock_check.js`,
      library: 'ci_stock_check'
    }
  },
  {
    extends: path.resolve(__dirname, './webpack.base.config.js'),
    entry: './src/import_products/index.tsx',
    output: {
      filename: `ci_import_products.js`,
      library: 'ci_import_products'
    }
  }
];
