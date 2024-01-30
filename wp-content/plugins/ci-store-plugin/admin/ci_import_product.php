<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';

/*

General purpose product import
This should be fired by a scheduled event

 */
function ci_import_product($supplier, $product_id)
{
    error_log('ci_import_product(' . $supplier . ', ' . $product_id . ')');
    $report = new Report();
    switch ($supplier) {
        case 'wps':
            import_western_product($product_id, false, $report);
            break;
    }
}

add_action('ci_import_product', 'ci_import_product', 12, 2);
