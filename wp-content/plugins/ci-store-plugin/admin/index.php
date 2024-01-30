<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/ReactSubpage.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/actions/ProductImporter.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/actions/StockCheck.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/LogFile.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';

new ReactSubpage('overview', 'Overview', 'ci-store-plugin-page', 'ci-store_page_');

new ProductImporter();
new ReactSubpage('import_products', 'Import Products', 'ci-store-plugin-page', 'ci-store_page_');

$stock_check = new StockCheck();
$stock_check->schedule('every_day');
new ReactSubpage('stock_check', 'Stock Check', 'ci-store-plugin-page', 'ci-store_page_');
