const path = require('path');

module.exports = [
  {
    extends: path.resolve(__dirname, './webpack.base.config.js'),
    entry: './src/utilities/index.tsx',
    output: {
      filename: `ci_utilities.js`,
      library: 'ci_utilities'
    }
  },
  // {
  //   extends: path.resolve(__dirname, './webpack.base.config.js'),
  //   entry: './src/manage_products/index.tsx',
  //   output: {
  //     filename: `ci_manage_products.js`,
  //     library: 'ci_manage_products'
  //   }
  // },
  // {
  //   extends: path.resolve(__dirname, './webpack.base.config.js'),
  //   entry: './src/manage_events/index.tsx',
  //   output: {
  //     filename: `ci_manage_events.js`,
  //     library: 'ci_manage_events'
  //   }
  // },
  // {
  //   extends: path.resolve(__dirname, './webpack.base.config.js'),
  //   entry: './src/overview/index.tsx',
  //   output: {
  //     filename: `ci_overview.js`,
  //     library: 'ci_overview'
  //   }
  // },
  {
    extends: path.resolve(__dirname, './webpack.base.config.js'),
    entry: './src/view/suppliers/index.tsx',
    output: {
      filename: `ci_suppliers.js`,
      library: 'ci_suppliers'
    }
  },
  // {
  //   extends: path.resolve(__dirname, './webpack.base.config.js'),
  //   entry: './src/stock_check/index.tsx',
  //   output: {
  //     filename: `ci_stock_check.js`,
  //     library: 'ci_stock_check'
  //   }
  // },
  // {
  //   extends: path.resolve(__dirname, './webpack.base.config.js'),
  //   entry: './src/import_products/index.tsx',
  //   output: {
  //     filename: `ci_import_products.js`,
  //     library: 'ci_import_products'
  //   }
  // }
];
