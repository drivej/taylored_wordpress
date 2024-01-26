<?php

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/print_utils.php';
include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/JobData.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/log/write_to_log_file.php';
require_once __DIR__ . '/get_western.php';
require_once __DIR__ . '/get_western_product.php';
require_once __DIR__ . '/get_western_products_count.php';
require_once __DIR__ . '/get_western_products_page.php';
require_once __DIR__ . '/western_utils.php';
require_once __DIR__ . '/wps_stock_check.php';

// init job
function wps_stock_check_init($info)
{
    error_log('wps_stock_check_init()');
    $total_products = get_western_products_count();
    $page_size = 100;
    $cursor = '';
    $info->save([
        'total_products' => $total_products,
        'updated' => gmdate("c"),
    ]);
    // begin the job loop
    do_action('stock_check_action', $cursor, $page_size);
}

// job loop
function wps_stock_check_action_callback($cursor, $page_size)
{
    $info = new JobData('stock_status');
    $is_stopping = $info->data['is_stopping'];
    error_log('wps_stock_check_action_callback() is_stopping=' . ($is_stopping ? 'true' : 'false'));

    if ($is_stopping) {
        error_log('break loop');
        $info->merge([
            'is_running' => false,
            'force_stop' => true,
        ]);
        $info->push();
    } else {
        $cursor = $info->data['cursor'];
        $page = get_western_products_page($cursor, null, $page_size);
        foreach ($page['data'] as $wps_product) {
            $res = process_product($wps_product);
            $info->tick($res);
            $info->tick('products_processed');
        }
        $cursor = $page['meta']['cursor']['next'];
        // sleep(5);

        if (!$cursor) {
            // complete job
            $info->merge([
                'cursor' => $cursor,
                'is_complete' => true,
                'is_running' => false,
                'is_stopping' => false,
                'is_stalled' => false,
                'completed' => gmdate("c"),
            ]);
            $info->push();
        } else {
            $info->merge([
                'updated' => gmdate("c"),
                'cursor' => $cursor,
            ]);
            $info->push();
            do_action('stock_check_action', $cursor, $page_size, $info);
        }
    }
}

add_action('stock_check_action', 'wps_stock_check_action_callback', 10, 2);

function process_page($cursor, $page_size, $report)
{
    $is_stopping = is_stopping_stock_check();
    $report->addData('cursor', $cursor);
    error_log('process_page() is_stopping=' . ($is_stopping ? 'true' : 'false'));

    if ($is_stopping) {
        update_option('wps_stock_check_in_progress', false);
        $report->addData('force_stop', true);
        $report->addData('completed', gmdate("c"));
    } else {
        update_option('wps_stock_check_in_progress', true);
        $page = get_western_products_page($cursor, null, $page_size);
        foreach ($page['data'] as $wps_product) {
            $res = process_product($wps_product);
            $report->tick($res);
            $report->tick('products_processed');
            update_option('wps_stock_check_in_progress', true);
        }
        $cursor = $page['meta']['cursor']['next'];

        if ($cursor) {
            update_option('wps_stock_check_info', $report->data);
            process_page($cursor, $page_size, $report);
        } else {
            $report->addData('completed', gmdate("c"));
            update_option('wps_stock_check_info', $report->data);
            update_option('wps_stock_check_in_progress', false);
        }
    }
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
    return $res;
}

function request_stop_stock_check()
{
    error_log('request_stop_stock_check()');
    $info = new JobData('stock_status');
    $info->save(['is_stopping' => true, 'is_running' => false]);
}

function get_job_is_stalled($info)
{
    if (isset($info->data['updated'])) {
        $updated_time = strtotime($info->data['updated']);
        $current_time = strtotime(gmdate("c"));
        $time_difference = $current_time - $updated_time;
        $minutes_elapsed = round($time_difference / 60);
        return $minutes_elapsed > 2;
    }
    return false;
}

function get_stock_check_info()
{
    $info = new JobData('stock_status');
    $is_stalled = get_job_is_stalled($info);

    if ($is_stalled) {
        $info->merge([
            'is_stalled' => true,
            'is_running' => false,
            'is_stopping' => true,
        ]);
        $info->push();
    }
    return $info->data;
}

function is_running_stock_check()
{
    $info = new JobData('stock_status');
    return $info->data['is_running'];
}

function is_stopping_stock_check()
{
    $info = new JobData('stock_status');
    return $info->data['is_stopping'];
}

function run_wps_stock_check()
{
    error_log('run_wps_stock_check()');
    if (is_running_stock_check()) {
        error_log('run_wps_stock_check() failed:busy');
        return;
    }
    $info = new JobData('stock_status');
    $info->save([
        'is_running' => true,
        'is_stopping' => false,
        'is_stalled' => false,
        'is_complete' => false,
        'force_stop' => false,
        'total_products' => 0,
        'started' => gmdate("c"),
        'resumed' => null,
        'cursor' => '',
        'products_processed' => 0,
        'update' => 0,
        'ignore' => 0,
        'insert' => 0,
    ]);

    wp_schedule_single_event(time() + 2, 'wps_stock_check_hook', [$info]);
}

function wps_stock_check_resume()
{
    if (is_running_stock_check()) {
        error_log('wps_stock_check_resume() failed:busy');
        return;
    }
    error_log('wps_stock_check_resume()');
    $info = new JobData('stock_status');
    $info->save([
        'is_running' => true,
        'is_stopping' => false,
        'is_stalled' => false,
        'is_complete' => false,
        'force_stop' => false,
        'total_products' => 0,
        'resumed' => gmdate("c"),
    ]);

    $cursor = $info->data['cursor'];
    $page_size = 100;

    // wp_schedule_single_event(time() + 2, 'wps_stock_check_hook', [$info]);

    do_action('stock_check_action', $cursor, $page_size);
}

// Hook your custom function to the scheduled event
add_action('wps_stock_check_hook', 'wps_stock_check_init');

function ci_stock_check_shutdown()
{
    if (wp_installing()) {
        error_log('ci_stock_check_shutdown>wp_installing()');
    }
    if (connection_aborted() && !headers_sent()) {
        error_log('ci_stock_check_shutdown()');
    }
}

add_action('shutdown', 'ci_stock_check_shutdown');
