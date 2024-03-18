<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
/*

General purpose product import
This should be fired by a scheduled event

 */
function ci_import_product($supplier_key, $supplier_product_id, $force_update = false, $report = new Report())
{
    ci_error_log(__FILE__, __LINE__, 'ci_import_product()' . $supplier_key . ', ' . $supplier_product_id . ')');
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier->import_product($supplier_product_id, $force_update, $report);
}

add_action('ci_import_product', 'ci_import_product', 12, 2);
