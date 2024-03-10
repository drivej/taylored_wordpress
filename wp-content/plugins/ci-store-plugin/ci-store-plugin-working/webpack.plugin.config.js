const path = require('path');

module.exports = [
  {
    extends: path.resolve(__dirname, './webpack.base.config.js'),
    entry: './src/test_admin/index.tsx',
    output: {
      filename: `ci_test_admin.js`,
      library: 'ci_test_admin'
    }
  },
  {
    extends: path.resolve(__dirname, './webpack.base.config.js'),
    entry: './src/manage_products/index.tsx',
    output: {
      filename: `ci_manage_products.js`,
      library: 'ci_manage_products'
    }
  },
  {
    extends: path.resolve(__dirname, './webpack.base.config.js'),
    entry: './src/manage_events/index.tsx',
    output: {
      filename: `ci_manage_events.js`,
      library: 'ci_manage_events'
    }
  },
  {
    extends: path.resolve(__dirname, './webpack.base.config.js'),
    entry: './src/overview/index.tsx',
    output: {
      filename: `ci_overview.js`,
      library: 'ci_overview'
    }
  },
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
