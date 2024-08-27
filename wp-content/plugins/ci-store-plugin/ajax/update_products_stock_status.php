<?php

namespace AjaxHandlers;

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/WooTools.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/AjaxManager.php';

function ci_update_products_stock_status($woo_ids)
{
    error_log('ci_update_products_stock_status', $woo_ids);
}

add_action('ci_update_products_stock_status', 'AjaxHandlers\ci_update_products_stock_status', 10, 1);

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

function update_products_stock_status($params)
{
    $supplier_key = \AjaxManager::get_param('supplier_key', null, $params);
    $supplier = \WooTools::get_supplier($supplier_key);

    $limit = 20;
    $args = array(
        // 'status' => 'publish',
        'limit' => $limit, // Limit to 10 products per page
        'page' => 1, // Page number
        'meta_query' => [['key' => '_ci_supplier_key', 'value' => $supplier_key]],
    );
    /** @var WC_Product[] $products */
    $products = wc_get_products($args);
    $woo_product_ids = [];
    $woo_product_lookup = [];

    foreach ($products as $product) {
        $supplier_key = $product->get_meta('_ci_supplier_key');
        $supplier_product_id = $product->get_meta('_ci_product_id');
        $woo_product_ids[] = $supplier_product_id;
        $woo_product_lookup[$supplier_product_id] = $product;
    }

    $params = [];
    $params['include'] = implode(',', [
        'items:filter(status_id|NLA|ne)',
    ]);
    $params['page[size]'] = $limit;
    $params['fields[items]'] = 'id,updated_at,status_id';
    $params['fields[products]'] = 'id,name,updated_at';

    $products = $supplier->get_api('products/' . implode(',', $woo_product_ids), $params);

    foreach ($products['data'] as $i => $supplier_product) {
        $woo_product = $woo_product_lookup[$supplier_product_id];

        $supplier_product_id = $supplier_product['id'];
        $supplier_stock_status = $supplier->is_available(['data' => $supplier_product]) ? 'instock' : 'outofstock';

        $woo_id = $woo_product->get_id();
        $woo_stock_status = $woo_product->get_stock_status();

        $needs_update = $supplier_stock_status !== $woo_stock_status;
        
        $products['data'][$i]['woo_id'] = $woo_id;
        $products['data'][$i]['supplier_stock_status'] = $supplier_stock_status;
        $products['data'][$i]['woo_stock_status'] = $woo_stock_status;
        $products['data'][$i]['needs_update'] = $needs_update;

        // $products['data'][$i]['woo_product_id'] = $woo_product_id;

        if ($needs_update) {
            // $product = wc_get_product( $woo['id'] );

            if ($woo_product) {
                // $woo_product->set_stock_status($supplier_stock_status);
                // $saved = $woo_product->save();
                // $products['data'][$i]['saved'] = $saved;
            }
            // wc_update_product_stock_status($woo['id'], $stock_status);
        }
    }

    return $products;

    // foreach ($products as $product) {
    //     $o = [];
    //     $supplier_key = $product->get_meta('_ci_supplier_key');
    //     $supplier_product_id = $product->get_meta('_ci_product_id');

    //     $o['supplier_key'] = $supplier_key;
    //     $o['supplier_product_id'] = $supplier_product_id;
    //     $o['stock_status'] = $supplier->check_is_available($supplier_product_id) ? 'instock' : 'outofstock';

    //     // echo 'Product ID: ' . $product->get_id() . '<br>';
    //     // echo 'Product Name: ' . $product->get_name() . '<br>';
    //     // echo 'Product Price: ' . $product->get_price() . '<br>';
    //     // // Additional product data can be accessed using methods like get_sku(), get_description(), etc.
    //     // echo '<br>';
    //     $productsult[] = $o;
    // }

    // return $productsult;

    // $updated = \AjaxManager::get_param('updated', null, $params);
    // $productsume = (bool) \AjaxManager::get_param('resume', null, $params);
    // $supplier = \CI\Admin\get_supplier($supplier_key);
    // $is_import_running = $supplier->is_import_running();
    // $is_import_scheduled = $supplier->is_import_scheduled();
    // $products_count = $supplier->get_products_count($updated);
    // $success = true;
    // $scheduled = false;

    // if (!$is_import_running && !$is_import_scheduled) {
    //     if (!$productsume) {
    //         $supplier->clear_import_report();
    //         $products_count = $supplier->get_products_count($updated);
    //         $supplier->update_import_report([
    //             'updated' => $updated,
    //             'products_count' => $products_count,
    //             'cursor' => '',
    //             'started' => gmdate("c"),
    //             'page_size' => 10,
    //         ]);
    //     }
    //     $scheduled = $supplier->schedule_import();
    // }

    // return [
    //     'supplier_key' => $supplier_key,
    //     'is_import_running' => $is_import_running,
    //     'is_import_scheduled' => $is_import_scheduled,
    //     'updated' => $updated,
    //     'products_count' => $products_count,
    //     'resume' => $productsume,
    //     'scheduled' => $scheduled,
    //     // 'params' => $params,
    //     'success' => $success,
    // ];
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
//             $productsume = (bool) \AjaxManager::get_param('resume', null, $params);
//             if ($productsume) {
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
