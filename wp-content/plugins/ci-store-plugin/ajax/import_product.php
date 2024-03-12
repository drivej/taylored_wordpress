<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';

require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';

// function Xci_import_product($supplier_key, $supplier_product_id, $report = new \Report())
// {
//     error_log('Xci_import_product(' . $supplier_key . ', ' . $supplier_product_id . ')');
//     switch ($supplier_key) {
//         case 'wps':
//             import_western_product($supplier_product_id, false, $report);
//             error_log(json_encode($report, JSON_PRETTY_PRINT));
//             break;
//     }
// }

// add_action('Xci_import_product', 'Xci_import_product', 12, 2);

function import_product($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key');
    $product_id = \AjaxManager::get_param('product_id');
    // $success = false;
    error_log($supplier_key . ':' . $product_id);

    $report = new \Report();
    ci_import_product($supplier_key, $product_id, $report);
    return ['report' => $report];

    // if ($supplier_key && $product_id) {
    //     $supplier = \CI\Admin\get_supplier($supplier_key);
    //     if ($supplier) {
    //         $is_scheduled = $supplier->is_import_product_scheduled($product_id);

    //         if (!$is_scheduled) {
    //             $success = $supplier->schedule_import_product($product_id);
    //         }

    //         return [
    //             'success' => $success,
    //             'is_scheduled' => $is_scheduled,
    //             'supplier_key' => $supplier_key,
    //             'product_id' => $product_id,
    //         ];
    //     }
    // }
    // return ['error' => 'missing supplier/product'];
}

// function start_test()
// {
//     $supplier_product_id = 999;
//     $supplier_key = 'wps';
//     $supplier = \CI\Admin\get_supplier($supplier_key);
//     $is_importing = $supplier->is_importing($supplier_product_id);

//     error_log('start_test wps_product_id=' . $supplier_product_id);
//     // $scheduled = wp_next_scheduled('ci_import_supplier_product', [$supplier_key, $supplier_product_id]);

//     if ($is_importing) {
//         $success = false;
//         $status = 'already scheduled';
//     } else {
//         $success = wp_schedule_single_event(time() + 1, 'ci_import_supplier_product', [$supplier_key, $supplier_product_id]);
//         $status = $success ? 'just scheduled' : 'failed';
//     }
//     $is_importing_check = $supplier->is_importing($supplier_product_id);
//     return [
//         'status' => $status, //
//         'success' => $success,
//         'is_importing_check' => $is_importing_check,
//         'is_importing' => $is_importing,
//         'supplier_key' => $supplier_key,
//         'supplier_product_id' => $supplier_product_id,
//     ];
// }
