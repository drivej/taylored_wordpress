<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';

/*

General purpose product import
This should be fired by a scheduled event

 */
function ci_import_product($supplier_key, $supplier_product_id, $report = new Report())
{
    // error_log('ci_import_product(' . $supplier_key . ', ' . $supplier_product_id . ')');
    switch ($supplier_key) {
        case 'wps':
            error_log('start ci_import_product(' . $supplier_key . ', ' . $supplier_product_id . ')');
            import_western_product($supplier_product_id, false, $report);
            // error_log(json_encode($report, JSON_PRETTY_PRINT));
            error_log('end ci_import_product(' . $supplier_key . ', ' . $supplier_product_id . ' -> ' . $report->data['action'] . ')');

            break;
    }
}

add_action('ci_import_product', 'ci_import_product', 12, 2);
