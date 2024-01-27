<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/ReactSubpage.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/actions/ProductImporter.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/actions/StockCheck.php';

new ReactSubpage('import_products', 'Import Products', 'ci-store-plugin-page', 'ci-store_page_', new ProductImporter());

new ReactSubpage('stock_check', 'Stock Check', 'ci-store-plugin-page', 'ci-store_page_', new StockCheck());