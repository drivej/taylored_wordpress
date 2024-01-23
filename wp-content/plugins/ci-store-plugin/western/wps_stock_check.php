<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/print_utils.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/log/write_to_log_file.php';
require_once __DIR__ . '/get_western.php';
require_once __DIR__ . '/get_western_product.php';
require_once __DIR__ . '/get_western_products_count.php';
require_once __DIR__ . '/get_western_products_page.php';
require_once __DIR__ . '/western_utils.php';
require_once __DIR__ . '/wps_stock_check.php';

function wps_stock_check()
{
    write_to_log_file('START wps_stock_check()');
    error_log('start stock check');

    $total_products = get_western_products_count();
    $page_size = 100;
    $page = get_western_products_page(null, null, $page_size);
    $cursor = $page['meta']['cursor']['next'];
    $products_processed = 0;
    $report = ['update' => 0, 'ignore' => 0, 'insert' => 0];
    $info = [
        'total_products' => $total_products,
        'started' => gmdate("c"),
        'cursor' => '',
        'products_processed' => $products_processed,
        'cursor' => '',
        'report' => $report,
    ];
    update_option('wps_stock_check_info', $info);

    while ($cursor) {
        $should_stop = get_option('wps_stock_check_should_stop', false);
        if (!$should_stop) {
            if (isset($page['data'])) {
                foreach ($page['data'] as $wps_product) {
                    $res = process_product($wps_product);
                    $report[$res]++;
                    $products_processed++;
                }
                update_option('wps_stock_check_info', [
                    ...$info,
                    'report' => $report, 
                    'cursor' => $cursor, 
                    'products_processed' => $products_processed
                ]);
            }
            $page = get_western_products_page($cursor, null, $page_size);
            $cursor = $page['meta']['cursor']['next'];
        } else {
            update_option('wps_stock_check_info', [...$info, 'force_stop' => true]);
            delete_option('wps_stock_check_should_stop');
            break;
        }
    }

    // printData(['page' => $page]);
    delete_option('wps_stock_check_in_progress');

    $info = get_option('wps_stock_check_info', []);
    update_option('wps_stock_check_info', [...$info, 'completed' => gmdate("c"), 'cursor' => $cursor]);

    write_to_log_file('END wps_stock_check()');
}

function process_product($wps_product)
{
    $wps_stock_status = has_valid_items($wps_product) ? 'instock' : 'outofstock';
    $wps_product_id = $wps_product['id'];
    $sku = get_western_sku($wps_product_id);
    $product_id = wc_get_product_id_by_sku($sku);
    $res = '';

    if ($product_id) {
        $woo_product = wc_get_product_object('product', $product_id);
        $woo_stock_status = $woo_product->get_stock_status();

        if ($woo_stock_status !== $wps_stock_status) {
            $res = 'update';
        } else {
            $res = 'ignore';
        }
    } else {
        if ($wps_stock_status === 'outofstock') {
            $res = 'ignore';
        } else {
            $res = 'insert';
        }
    }
    // $info = get_option('wps_stock_check_info', []);
    // update_option('wps_stock_check_info', [...$info, $wps_product_id . '_res' => $res]);

    return $res;
}

function get_western_list_stock_status()
{

}

$timestamp = time() + 10; // Set the timestamp for 24 hours from now

// Schedule the event
// wp_schedule_single_event($timestamp, $hook);

function is_running_stock_check()
{
    $flag = get_option('wps_stock_check_in_progress', false);
    return (bool) $flag;
}

function run_wps_stock_check()
{
    if (is_running_stock_check()) {
        print('stock check currently running');
        return;
    }
    update_option('wps_stock_check_in_progress', true);
    $total_products = get_western_products_count();
    update_option('wps_stock_check_info', [
        'total_products' => $total_products, //
        'started' => gmdate("c"),
        'cursor' => '',
        'products_processed' => 0,
        'cursor' => '',
    ]);
    write_to_log_file('run_wps_stock_check()');
    print('ran stock check');
    $res = wp_schedule_single_event(time() + 10, 'wps_stock_check_hook');
    printData($res);
}

// Hook your custom function to the scheduled event
add_action('wps_stock_check_hook', 'wps_stock_check');
