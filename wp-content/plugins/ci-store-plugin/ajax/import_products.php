<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/suppliers/get_supplier.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/Report.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';

function ci_import_products_page($supplier_key)
{
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier->ping();
    $supplier->set_is_import_running(true);
    $report = $supplier->get_import_report();
    $isAggressive = isset($report['import_type']) && $report['import_type'] === 'aggressive';
    $force_update = true;

    // fix page_size=0
    if (!is_numeric($report['page_size']) || $report['page_size'] < 10) {
        $supplier->update_import_report(['page_size' => 10]);
    }
    ci_error_log('ci_import_products_page()' . json_encode(['cursor' => $report['cursor'], 'page_size' => $report['page_size'], 'updated' => $report['updated']]));
    $products = $supplier->get_products_page($report['cursor'], $report['page_size'], $report['updated']);

    // sometimes the data doesn't return anything - try again
    if (!isset($products['data'])) {
        ci_error_log(__FILE__, __LINE__, $supplier_key . ' api failed - sleep 10, the try again');
        sleep(10);
        $products = $supplier->get_products_page($report['cursor'], $report['page_size'], $report['updated']);
    }

    $cancelled = false;
    $stalled = false;

    if (isset($products['data'])) {
        // schedule and event to import each product
        $tally = ['insert' => [], 'update' => [], 'delete' => [], 'ignore' => []];
        ci_error_log('Recieved ' . count($products['data']) . ' products');

        foreach ($products['data'] as $product) {
            if ($isAggressive) {
                $action = $supplier->get_update_action($product); //
                $product_id = $product['id'];
                $tally[$action][] = $product_id;
                ci_error_log('ci_import_products_page() ' . $supplier_key . ':' . $product_id . ' ' . $action);
                $product_report = new \Report();
                // $supplier->import_product($product['id'], $product_report);

                switch ($action) {
                    case 'insert':
                        $supplier->insert_product($product_id, $product_report);
                        break;

                    case 'update':
                        $supplier->update_product($product_id, $product_report);
                        break;

                    case 'delete':
                        $supplier->delete_product($product_id, $product_report);
                        // $sku = $supplier->get_product_sku($product['id']);
                        // $product_id = wc_get_product_id_by_sku($sku);
                        // wp_delete_post($product_id, true);
                        break;

                    case 'ignore':
                        break;
                }
                // let wp know we are alive
                $supplier->ping();
            } else {
                $product_id = $product['id'];
                $is_scheduled = (bool) wp_next_scheduled('ci_import_product', [$supplier_key, $product_id]);
                if (!$is_scheduled) {
                    $scheduled = wp_schedule_single_event(time() + 1, 'ci_import_product', [$supplier_key, $product_id]);
                }
            }

            // escape hatch
            if ($supplier->should_cancel_import()) {
                $cancelled = true;
                ci_error_log('ci_import_products_page() ABORTED');
                break;
            }

            if ($supplier->should_stall_import()) {
                $stalled = true;
                ci_error_log('ci_import_products_page() FORCE STALLED');
                break;
            }
        }

        // log pretty useful data
        $useful_data = array_filter($tally, fn($v) => count($v));
        $results = '';
        foreach ($useful_data as $k => $v) {
            $results .= "\n\t" . $k . ': (' . count($v) . ') ' . implode(',', $v);
        }
        ci_error_log('ci_import_products_page() ' . $results);

        $cursor = $products['meta']['cursor']['next'];

        if ($stalled) {
            ci_error_log('stall import');
            $supplier->clear_stall_test();
            return;
        }

        if (!$cancelled) {
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
                $is_scheduled = (bool) wp_next_scheduled('ci_import_products_page', [$supplier_key]);
                if (!$is_scheduled) {
                    $scheduled = wp_schedule_single_event(time() + 1, 'ci_import_products_page', [$supplier_key]);
                    if (!$scheduled) {
                        $supplier->set_is_import_running(false);
                        $supplier->update_import_report(['error' => 'schedule failed']);
                        ci_error_log(__FILE__, __LINE__, 'ci_import_products_page() schedule failed');
                    }
                } else {
                    ci_error_log(__FILE__, __LINE__, 'ci_import_products_page() schedule page import already scheduled - How did this duplicate?');
                }
            }
        } else {
            $supplier->set_is_import_running(false);
        }
    } else {
        // try again
        $supplier->set_is_import_running(false);
        ci_error_log(__FILE__, __LINE__, 'ci_import_products_page() product data empty');
    }
}

add_action('ci_import_products_page', 'AjaxHandlers\ci_import_products_page', 10, 1);

function stall_import($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    $supplier->stall_import();
    return ['stall attempted'];
}

function import_products($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \CI\Admin\get_supplier($supplier_key);
    return $supplier->start_import_products();
    /*
$updated = \AjaxManager::get_param('updated', null, $params);
$resume = (bool) \AjaxManager::get_param('resume', null, $params);
$import_type = \AjaxManager::get_param('import_type', null, $params);
$page_size = \AjaxManager::get_param('page_size', 10, $params);
$cursor = \AjaxManager::get_param('cursor', '', $params);
$is_import_running = $supplier->is_import_running();
$is_import_scheduled = $supplier->is_import_scheduled();
$products_count = -1;
$scheduled = false;

if (!$is_import_running && !$is_import_scheduled) {
if (!$resume) {
$supplier->clear_import_report();
$products_count = $supplier->get_products_count($updated);
$supplier->update_import_report([
'updated' => $updated,
'products_count' => $products_count,
'cursor' => $cursor,
'started' => gmdate("c"),
'page_size' => $page_size,
'import_type' => $import_type,
]);
} else {
$supplier->update_import_report([
'import_type' => $import_type,
'page_size' => $page_size,
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
'import_type' => $import_type,
'report' => $report,
];
 */
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
