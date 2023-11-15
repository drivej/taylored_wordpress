<?php

require_once __DIR__ . '/ci-store-func.php';
include_once __DIR__ . '/ci-store-utils.php';

$option_key = 'ci_update_products_schedule_status';

$default_job = array(
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
        update_option('ci_update_products_started', 'started' . time());
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
                $cronjob['status'] = 'started';
                break;

            case 'pause':
                $cronjob['status'] = 'paused';
                break;

            case 'resume':
                $cronjob['status'] = 'running';
                break;

            case 'stop':
                $cronjob = $default_job;
                break;

            case 'test':
                $result = doTest();
                wp_send_json($result, null, JSON_PRETTY_PRINT);
                break;

        }
        update_option($option_key, $cronjob);
    }
    $next = wp_next_scheduled('ci_update_products');
    if ($next !== false) {
        $cronjob['next'] = date('c', $next);
    }
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

function mapProducts($product)
{
    return ['id' => $product['id'], 'isValid' => count($product['items']['data']) > 0];
}

function filterNonEmptyData($item)
{
    return count($item['items']['data']) > 0;
}

function extractIds($item)
{
    return $item['id'];
}

function ci_update_products_action()
{
    global $default_job, $option_key;
    $cronjob = get_option($option_key, $default_job);

    switch ($cronjob['status']) {
        case 'paused':
        case 'idle':
        case 'error':
        case 'completed':
            return;

        case 'started':
            $cronjob['products_total'] = getWesternProductsCount();
            $cronjob['products_loaded'] = 0;
            $cronjob['products_count'] = 0;
            $cronjob['products_current'] = 0;
            $cronjob['products_processed'] = 0;
            $cronjob['status'] = 'running';
            $cronjob['cursor'] = '';
            $cronjob['started'] = current_time('mysql', 1);
            $cronjob['products'] = array();
            update_option($option_key, $cronjob);
            break;

        case 'running':
            if (count($cronjob['products'])) {
                // process product on each round
                $cronjob['products_current'] = array_pop($cronjob['products']);
                $cronjob['products_processed'] += 1;
            } else {
                // load new page of products
                $data = getWesternProductsPage($cronjob['cursor']);
                // $cronjob['data'] = array_map('mapProducts', $data['data']);

                if (isset($data['data'])) {
                    // $cronjob['data'] = $data['data'];
                    $products = array_map('mapProducts', $data['data']);
                    $cronjob['products'] = $products;
                    $cronjob['cursor'] = $data['meta']['cursor']['next'];
                    // $cronjob['products_loaded'] += get_var($data, ['meta', 'cursor', 'count'], 0);
                    $cronjob['products_loaded'] += count($data['data']);
                    $cronjob['products_valid'] += count($products);

                    while (count($cronjob['products'])) {
                        // process product on each round
                        $cronjob['products_current'] = array_pop($cronjob['products']);
                        $cronjob['products_processed'] += 1;
                        $cronjob['updated'] = current_time('mysql', 1);
                        update_option($option_key, $cronjob);
                        sleep(2);
                    }

                    // $cronjon['products'] = [1, 2, 3, 4]; //array_values(array_map('mapProducts', $data['data']));
                    // $validProducts = array_filter($data['data'], 'filterNonEmptyData');
                    // $values = array_values($validProducts);
                    // $cronjob['products_valid'] = array_map('extractIds', $values);
                    // if (isset($data['meta']['cursor']['next'])) {
                    //     $cronjob['cursor'] = $data['meta']['cursor']['next'];
                    // } else {
                    //     $cronjob['cursor'] = '';
                    // }
                    // $cronjob['cursor'] = isset($data['meta']['cursor']['next']) ? $data['meta']['cursor']['next'] : 'DONE'; // get_var($data, ['meta', 'cursor', 'next'], 'done');
                    // $cronjob['completed'] = current_time('mysql', 1);
                    // $cronjob['status'] = 'completed';
                } else {
                    $cronjob['status'] = 'error';
                }
            }
            $cronjob['updated'] = current_time('mysql', 1);
            update_option($option_key, $cronjob);
            break;
    }

    // if ($cronjob['status'] === 'paused' || $cronjob['status'] === 'idle' || $cronjob['status'] === 'error') {
    //     return;
    // }
    // if ($cronjob['status'] === 'started') {
    //     $cronjob['products_total'] = getWesternProductsCount();
    //     $cronjob['products_loaded'] = 0;
    //     $cronjob['products_count'] = 0;
    //     $cronjob['status'] = 'running';
    //     $cronjob['started'] = current_time('mysql', 1);
    // }
    // // don't duplicate this process
    // if ($cronjob['status'] === 'running') {
    //     //     $cronjob['status'] = 'stacked';
    //     //     update_option($option_key, $cronjob);
    //     //     return;

    //     // set status running
    //     // $cronjob['status'] = 'running';
    //     // update_option($option_key, $cronjob);

    //     // try {

    //     if ($cronjob['cursor'] === null) {
    //         $cronjob['products_total'] = getWesternProductsCount();
    //         $cronjob['products_loaded'] = 0;
    //         $cronjob['products_count'] = 0;
    //         // $cronjob['status'] = 'running';
    //         $cronjob['started'] = current_time('mysql', 1);
    //     }

    //     if ($cronjob['cursor'] === null || isset($cronjob['cursor'])) {
    //         // if ($cronjob['cursor'] === 'DONE') {
    //         //     $cronjob['status'] = 'terminated';
    //         // } else {
    //         $data = getWesternProductsPage($cronjob['cursor']);
    //         if (isset($data['data'])) {
    //             // $cronjob['data'] = $data['data'];
    //             $cronjob['products_loaded'] += get_var($data, ['meta', 'cursor', 'count'], 0);
    //             // $cronjob['products_count'] += count($data['data']);
    //             $cronjon['products'] = [1, 2, 3, 4]; //array_values(array_map('mapProducts', $data['data']));
    //             // $validProducts = array_filter($data['data'], 'filterNonEmptyData');
    //             // $values = array_values($validProducts);
    //             // $cronjob['products_valid'] = array_map('extractIds', $values);
    //             if (isset($data['meta']['cursor']['next'])) {
    //                 $cronjob['cursor'] = $data['meta']['cursor']['next'];
    //             } else {
    //                 $cronjob['cursor'] = '';
    //             }
    //             // $cronjob['cursor'] = isset($data['meta']['cursor']['next']) ? $data['meta']['cursor']['next'] : 'DONE'; // get_var($data, ['meta', 'cursor', 'next'], 'done');
    //             // $cronjob['completed'] = current_time('mysql', 1);
    //             $cronjob['status'] = 'completed';
    //         } else {
    //             $cronjob['status'] = 'error';
    //         }
    //     } else {
    //         $cronjob['status'] = 'completed';
    //     }
    // }

    $cronjob['updated'] = current_time('mysql', 1);
    update_option($option_key, $cronjob);
    // } catch (Exception $e) {
    //     $status['error'] = $e;
    //     update_option($option_key, $cronjob);
    // }
}

add_action('ci_update_products', 'ci_update_products_action');
