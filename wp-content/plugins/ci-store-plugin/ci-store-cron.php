<?php

require_once __DIR__ . '/ci-store-func.php';
include_once __DIR__ . '/ci-store-utils.php';

$option_key = 'ci_update_products_schedule_status';

$default_job = array(
    'is_running' => false,
    'status' => 'idle', // idle, started, running, paused, completed, error
    'started' => null,
    'updated' => null,
    'products' => array(),
    'cursor' => null,
    'data' => null,
);

// init product scheduler

function schedule_product_update()
{
    $next = wp_next_scheduled('ci_update_products');
    if (!$next) {
        wp_schedule_event(time(), 'every_minute', 'ci_update_products');
    }
}

add_action('wp', 'schedule_product_update');

function ci_store_cronjob_api()
{
    global $default_job, $option_key;
    $cronjob = get_option($option_key, $default_job);

    if (isset($_GET['cmd'])) {
        switch ($_GET['cmd']) {

            case 'start':
                if ($cronjob['is_running'] === false) {
                    $cronjob = updateJob(['status' => 'started']);
                    // $cronjob['status'] = 'started';
                    // update_option($option_key, $cronjob);
                    do_ci_update_products_action();
                    // if ($next === false) {
                    //     wp_schedule_event(time() + 10, 'every_minute', 'ci_update_products');
                    // }
                }
                // schedule_product_update();
                break;

            case 'pause':
                if ($cronjob['is_running'] === true) {
                    $cronjob = updateJob(['status' => 'paused']);
                    // $cronjob['status'] = 'paused';
                    // update_option($option_key, $cronjob);
                    // wp_clear_scheduled_hook('ci_update_products');
                }
                break;

            case 'resume':
                if ($cronjob['status'] === 'paused') {

                    $cronjob = updateJob(['status' => 'resume']);
                    // $cronjob['status'] = 'resume';
                    // update_option($option_key, $cronjob);
                    do_ci_update_products_action();
                    // schedule_product_update();
                    // wp_schedule_event(time() + 10, 'every_minute', 'ci_update_products');
                }
                break;

            case 'stop':
                $cronjob = $default_job;
                // wp_clear_scheduled_hook('ci_update_products');
                break;

            case 'test':
                $result = doTest();
                wp_send_json($result, null, JSON_PRETTY_PRINT);
                break;

        }
        update_option($option_key, $cronjob);
    }
    $next = wp_next_scheduled('ci_update_products');
    $cronjob['next'] = $next !== false ? date('c', $next) : $next;
    $cronjob['now'] = current_time('mysql', 1);
    wp_send_json($cronjob, null, JSON_PRETTY_PRINT);
}

add_action('wp_ajax_ci_store_cronjob_api', 'ci_store_cronjob_api');

function doTest()
{
    global $default_job, $option_key;
    $cronjob = get_option($option_key, $default_job);

    if (count($cronjob['products'])) {
        $cronjob['products_current'] = array_pop($cronjob['products']);
    } else {
        // if(isset($cronjob['cursor']){
        $data = getWesternProductsPage($cronjob['cursor']);

        if (isset($data['data'])) {
            $products = array_map('mapProducts', $data['data']);
            $cronjob['products'] = $products;
            $cronjob['cursor'] = $data['meta']['cursor']['next'];
            // return $products;
        }
        // if (isset($data['meta']['cursor']['next'])) {
        //     $cronjob['cursor'] = $data['meta']['cursor']['next'];
        // } else {
        //     $cronjob['cursor'] = '';
        // }
    }
    update_option($option_key, $cronjob);

    return $cronjob;

    //             if (isset($data['data'])) {
    //                 // $cronjob['data'] = $data['data'];
    //                 $cronjob['products_loaded'] += get_var($data, ['meta', 'cursor', 'count'], 0);
    //                 $cronjob['products_count'] += count($data['data']);
    //                 $cronjon['products'] = [1, 2, 3, 4]; //array_values(array_map('mapProducts', $data['data']));
}
// import action

function isValidProduct($product)
{
    return count($product['items']['data']) > 0;
}

function filterValidProducts($product)
{
    return ['id' => $product['id'], 'isValid' => isValidProduct($product)];
}

function filterNonEmptyData($item)
{
    return count($item['items']['data']) > 0;
}

function extractIds($item)
{
    return $item['id'];
}

function getJob()
{
    global $default_job, $option_key;
    return get_option($option_key, $default_job);
}

function updateJob($delta)
{
    global $default_job, $option_key;
    $cronjob = get_option($option_key, $default_job);
    $update = array_merge($cronjob, $delta);
    update_option($option_key, $update);
    return $update;
}

function ci_update_products_action()
{
    // cron job fires this
    // global $default_job, $option_key;
    $cronjob = getJob(); //get_option($option_key, $default_job);

    // $cronjob['attempt_auto_start_success'] = false;

    if ($cronjob['is_running'] === false) {
        if ($cronjob['status'] === 'idle') {
            $cronjob['attempt_auto_start_success'] = true;
            $cronjob = updateJob(['status' => 'started', 'attempt_auto_start_success' => true]);
            do_ci_update_products_action();
        }
    }
    $cronjob = updateJob(['attempt_auto_start_success' => false]);
    // $cronjob['attempt_auto_start'] = current_time('mysql', 1);
    // update_option($option_key, $cronjob);
    // if ($cronjob['status'] === 'started' || $cronjob['status'] === 'resume') {
    //     do_ci_update_products_action();
    // }
}

//
//
// Main Controller
//
//

function do_ci_update_products_action()
{
    $cronjob = getJob(); //updateJob(['is_running' => true]);
    $status = $cronjob['status'];

    if ($status === 'paused') {
        return;
    }

    // $cronjob = updateJob(['is_running' => 'true']);

    if ($status === 'started') {
        $cronjob = updateJob([
            'is_running' => true,
            'status' => 'running',
            'loops' => 0,
            'started' => current_time('mysql', 1),
        ]);
    }

    if ($status === 'resume') {
        $cronjob = updateJob(['is_running' => true, 'status' => 'running']);
    }

    $status = $cronjob['status'];

    while ($status === 'running') {
        sleep(1);
        $cronjob = updateJob([
            'loop_status' => $cronjob['status'],
            'loops' => $cronjob['loops'] + 1,
            'elapsed' => time() - strtotime($cronjob['started']),
        ]);
        $status = $cronjob['status'];
    }
    $cronjob = updateJob(['is_running' => false]);
}

function Xci_update_products_action()
{
    global $default_job, $option_key;
    $cronjob = get_option($option_key, $default_job);
    $cursor = $cronjob['cursor'];

    if ($cronjob['status'] === 'paused') {
        return;
    }

    if ($cronjob['status'] === 'idle') {
        return; //$cronjob['status'] = 'started';
    }

    if ($cronjob['status'] === 'started') {
        $cronjob['status'] = 'running';
        if (!isset($cronjob['lastUpdate'])) {
            $cronjob['lastUpdate'] = '2020-01-01';
        } else {
            $cronjob['lastUpdate'] = date('Y-m-d');
        }
        $cronjob['products_total'] = getWesternProductsCount($cronjob['lastUpdate']);
        $cronjob['started'] = current_time('mysql', 1);
        $cronjob['cursor'] = 'START';
        $cursor = 'START';
        $cronjob['while'] = 0;
        update_option($option_key, $cronjob);
    }

    while (isset($cursor) && $cronjob['status'] === 'running') {
        $cronjob = get_option($option_key, $default_job);
        // $cronjob['status_loop1'] = $cronjob['status'];

        // $cronjob['while']++;
        $data = getWesternProductsPage($cursor === 'START' ? '' : $cursor, $cronjob['lastUpdate']);
        $products = array_map('filterValidProducts', $data['data']);
        $cronjob['products'] = $products;
        $cronjob['loop_1_start_status'] = $cronjob['status'];
        update_option($option_key, $cronjob);
        // $count = count($data['data']);
        // for($i=0; $i<$count; $i++){
        while (count($products) && $cronjob['status'] === 'running') {
            $cronjob = get_option($option_key, $default_job);
            $cronjob['loop_2_start_status'] = $cronjob['status'];
            update_option($option_key, $cronjob);
            $product_info = array_pop($products);
            if ($product_info['isValid']) {
                // update/insert
                $product = getWesternProduct($product_info['id']);
                $action = 'update/insert';
            } else {
                // delete
                $product = $product_info;
                $action = 'delete';
            }
            $cronjob = get_option($option_key, $default_job);
            $cronjob['current_product'] = $product;
            $cronjob['current_action'] = $action;
            $cronjob['products'] = $products;
            $cronjob['loop_2_end_status'] = $cronjob['status'];
            update_option($option_key, $cronjob);
            sleep(1);
            $cronjob = get_option($option_key, $default_job);
            if ($cronjob['status'] !== 'running') {
                break;
            }
        }
        $cursor = $data['meta']['cursor']['next'];
        // $cronjob['while_status'] = $cronjob['status'];
        $cronjob['cursor'] = $cursor;
        $cronjob['updated'] = current_time('mysql', 1);
        $cronjob['loop_1_end_status'] = $cronjob['status'];
        update_option($option_key, $cronjob);
        sleep(1);
        $cronjob = get_option($option_key, $default_job);
        if ($cronjob['status'] !== 'running') {
            break;
        }
    }
}

// function processPage($cursor, $lastUpdate)
// {
//     global $option_key;
//     // $cronjob = get_option($option_key, $default_job);
//     // $cursor = $cronjob['cursor'];
//     // $cronjob['while']++;
//     $data = getWesternProductsPage($cursor, $lastUpdate);
//     $products = $data['data']; //array_map('filterValidProducts', $data['data']);
//     $cronjob['products'] = $products;
//     update_option($option_key, $cronjob);

//     while (count($products) && $cronjob['status'] === 'running') {
//         processProduct($products);
//         //     $cronjob = get_option($option_key, $default_job);
//         //     $product_info = array_pop($products);
//         //     $cronjob['products'] = $products;
//         //     $cronjob['test'] = 'mikey';

//         //     if (isValidProduct($product_info)) {
//         //         // update/insert
//         //         $product = getWesternProduct($product_info['id']);
//         //         $cronjob['current_product'] = $product;
//         //         $cronjob['current_action'] = 'update/insert';
//         //     } else {
//         //         // delete
//         //         $cronjob['current_product'] = $product_info;
//         //         $cronjob['current_action'] = 'delete';
//         //     }
//         //     update_option($option_key, $cronjob);
//     }
//     $cursor = $data['meta']['cursor']['next'];
//     $cronjob['while_status'] = $cronjob['status'];
//     $cronjob['cursor'] = $cursor;
//     $cronjob['updated'] = current_time('mysql', 1);
//     update_option($option_key, $cronjob);
//     sleep(1);
// }

// function processProduct()
// {
//     global $default_job, $option_key;
//     $cronjob = get_option($option_key, $default_job);
//     $product_info = array_pop($products);
//     $cronjob['products'] = $products;
//     $cronjob['test'] = 'mikey';

//     if (isValidProduct($product_info)) {
//         // update/insert
//         $product = getWesternProduct($product_info['id']);
//         $cronjob['current_product'] = $product;
//         $cronjob['current_action'] = 'update/insert';
//     } else {
//         // delete
//         $cronjob['current_product'] = $product_info;
//         $cronjob['current_action'] = 'delete';
//     }
//     update_option($option_key, $cronjob);
// }

add_action('ci_update_products', 'ci_update_products_action');
