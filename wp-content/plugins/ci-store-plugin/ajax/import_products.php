<?php

namespace AjaxHandlers;

include_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function ci_import_products_page($supplier_key)
{
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier->ping();
    $supplier->set_is_import_running(true);
    $report = $supplier->get_import_report();

    // fix page_size=0
    if (!is_numeric($report['page_size']) || $report['page_size'] < 10) {
        $supplier->update_import_report(['page_size' => 10]);
    }

    $products = $supplier->get_products_page($report['cursor'], $report['page_size'], $report['updated']);

    // sometimes the data doesn't return anything - try again
    if (!isset($products['data'])) {
        sleep(10);
        $products = $supplier->get_products_page($report['cursor'], $report['page_size'], $report['updated']);
    }

    if (isset($products['data'])) {

        // error_log(json_encode($products, JSON_PRETTY_PRINT));
        // schedule and event to import each product
        foreach ($products['data'] as $product) {
            $product_id = $product['id'];
            $is_scheduled = (bool) wp_next_scheduled('ci_import_product', [$supplier_key, $product_id]);
            if (!$is_scheduled) {
                $scheduled = wp_schedule_single_event(time() + 1, 'ci_import_product', [$supplier_key, $product_id]);
            }
        }

        $cursor = $products['meta']['cursor']['next'];

        $supplier->update_import_report([
            'processed' => $report['processed'] + count($products['data']),
            'cursor' => $cursor,
        ]);

        if (!$cursor) {
            $supplier->update_import_report(['completed' => gmdate("c")]);
            $supplier->set_is_import_running(false);
        } else if ($supplier->should_cancel_import()) {
            $supplier->set_is_import_running(false);
        } else {
            // schedule and event to load the next page of products
            $scheduled = wp_schedule_single_event(time() + 1, 'ci_import_products_page', [$supplier_key]);
            if (!$scheduled) {
                $supplier->set_is_import_running(false);
                $supplier->update_import_report(['error' => 'schedule failed']);
                error_log('ci_import_products_page() schedule failed');
            }
        }
    } else {
        // try again
        $supplier->set_is_import_running(false);
        error_log('ci_import_products_page() product data empty');
    }

}

add_action('ci_import_products_page', 'AjaxHandlers\ci_import_products_page', 10, 1);

// function Xci_import_supplier_products_page($supplier_key) //, $updated)
// {
//     $supplier = \CI\Admin\get_supplier($supplier_key);
//     $report = $supplier->get_import_report();
//     $updated = $report['updated'];
//     $cursor = $report['cursor'];
//     $products_count = $supplier->get_products_count($updated);
//     $supplier->update_import_report(['products_count' => $products_count]);
//     $is_running = $supplier->set_is_import_running(true);

//     update_option('ci_import_supplier_products_running', true);

//     $processed = 0;
//     $products = $supplier->get_products_page($cursor, 10, $updated);

//     while ($is_running) {
//         $supplier->update_import_report(['cursor' => $cursor]);

//         if (isset($products['data'])) {
//             foreach ($products['data'] as $product) {
//                 $product_id = $product['id'];
//                 $supplier->ping();
//                 error_log('import product ' . $processed . ': ' . $product_id);
//                 $processed++;
//                 $supplier->update_import_report(['processed' => $processed, 'cursor' => $cursor]);

//                 do_action('ci_import_product', $supplier_key, $product_id);

//                 if ($supplier->should_cancel_import()) {
//                     $is_running = false;
//                     break;
//                 }
//             }
//             $cursor = $products['meta']['cursor']['next'];
//             if ($cursor) {
//                 $products = $supplier->get_products_page($cursor, 10, $updated);
//             } else {
//                 break;
//             }
//         } else {
//             break;
//         }
//         if ($supplier->should_cancel_import()) {
//             $is_running = false;
//             break;
//         }
//         sleep(3);
//     }
//     $supplier->set_is_import_running(false);
// }

// add_action('ci_import_products_event', 'AjaxHandlers\ci_import_products_event', 10, 1);

function import_products($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $updated = \AjaxManager::get_param('updated', null, $params);
    $resume = (bool) \AjaxManager::get_param('resume', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $is_import_running = $supplier->is_import_running();
    $is_import_scheduled = $supplier->is_import_scheduled();
    $products_count = $supplier->get_products_count($updated);
    $success = true;
    $scheduled = false;

    if (!$is_import_running && !$is_import_scheduled) {
        if (!$resume) {
            $supplier->clear_import_report();
            $products_count = $supplier->get_products_count($updated);
            $supplier->update_import_report([
                'updated' => $updated,
                'products_count' => $products_count,
                'cursor' => '',
                'started' => gmdate("c"),
                'page_size' => 10, // TODO: raise the page size
            ]);
        }
        $scheduled = $supplier->schedule_import();
    }

    $report = $supplier->get_import_report();

    return [
        'supplier_key' => $supplier_key,
        'is_import_running' => $is_import_running,
        'is_import_scheduled' => $is_import_scheduled,
        'updated' => $updated,
        'products_count' => $products_count,
        'resume' => $resume,
        'scheduled' => $scheduled,
        'report' => $report,
        'success' => $success,
    ];
}

// function Ximport_products($params)
// {
//     $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);

//     if ($supplier_key) {
//         $supplier = \CI\Admin\get_supplier($supplier_key);
//         if ($supplier) {
//             $updated = \AjaxManager::get_param('updated', null, $params);
//             $is_import_running = $supplier->is_import_running();
//             $is_import_scheduled = $supplier->is_import_scheduled();
//             $success = false;

//             if ($is_import_running || $is_import_scheduled) {
//                 return [
//                     'is_import_running' => $is_import_running,
//                     'is_import_scheduled' => $is_import_scheduled,
//                     'updated' => $updated,
//                     'params' => $params,
//                     'supplier_key' => $supplier_key,
//                     'success' => $success,
//                 ];
//             }

//             $cursor = '';
//             $resume = (bool) \AjaxManager::get_param('resume', null, $params);
//             if ($resume) {
//                 $report = $supplier->get_import_report();
//                 if (isset($report['cursor'])) {
//                     $cursor = $report['cursor'];
//                 }
//                 if (isset($report['updated'])) {
//                     $updated = $report['updated'];
//                 }
//             }

//             $supplier->clear_import_report();
//             $products_count = $supplier->get_products_count($updated);
//             $supplier->update_import_report(['updated' => $updated, 'cursor' => $cursor]);
//             $success = $supplier->schedule_import();

//             return [
//                 'supplier_key' => $supplier_key,
//                 'is_import_running' => $is_import_running,
//                 'is_import_scheduled' => $is_import_scheduled,
//                 'updated' => $updated,
//                 'total_products' => $products_count,
//                 'params' => $params,
//                 'success' => $success,
//             ];

//         }
//     }
//     return ['error' => 'missing supplier/product'];
// }
