<?php

require_once __DIR__ . '/ci-store-func.php';
include_once __DIR__ . '/ci-store-utils.php';
include_once __DIR__ . '/ci-store-log.php';

$option_key = 'ci_update_products_schedule_status';
/*
starting
started
pausing
paused
resuming -> started
stopping
stopped -> starting
 */
$default_job = array(
    'is_running' => false,
    'status' => 'stopped', // Xidle, starting, started, running, paused, completed, error
    'started' => null,
    'updated' => null,
    'products' => array(),
    'cursor' => null,
    'data' => null,
    'version' => 1.1,
);

// init product scheduler
// NOTE: this runs every time wp is refreshed so be careful!!
function schedule_product_update()
{
    $next = wp_next_scheduled('ci_handle_schedule_event');
    write_to_log_file("schedule_product_update() next=" . date('c', $next));
    if (!$next) {
        wp_schedule_event(time(), 'every_minute', 'ci_handle_schedule_event');
    }
}

add_action('wp', 'schedule_product_update');

function ci_handle_schedule_event()
{
    $cronjob = getJob();
    write_to_log_file("ci_handle_schedule_event() status:" . $cronjob['status']);
    if ($cronjob['status'] === 'stopped') {
        ci_cronjob_do_cmd('start');
    }
}

add_action('ci_handle_schedule_event', 'ci_handle_schedule_event');

function ci_cronjob_do_cmd($cmd)
{
    global $default_job;
    $cronjob = getJob();
    write_to_log_file("ci_cronjob_do_cmd(" . $cmd . ")" . " status:" . $cronjob['status']);

    switch ($cmd) {

        case 'start':
            if ($cronjob['status'] === 'stopped') {
                // write_to_log_file("ci_cronjob_do_cmd() " . $cmd . " status:" . $cronjob['status']);
                $cronjob = updateJob(['status' => 'starting']);
                ci_update_products_action();
            }
            break;

        case 'pause':
            if ($cronjob['status'] === 'started') {
                // write_to_log_file("ci_cronjob_do_cmd() " . $cmd . " status:" . $cronjob['status']);
                $cronjob = updateJob(['status' => 'pausing']);
                ci_update_products_action();
            }
            break;

        case 'resume':
            if ($cronjob['status'] === 'paused') {
                // write_to_log_file("ci_cronjob_do_cmd() " . $cmd . " status:" . $cronjob['status']);
                $cronjob = updateJob(['status' => 'resuming']);
                ci_update_products_action();
            }
            break;

        case 'stop':
            if ($cronjob['status'] === 'started' || $cronjob['status'] === 'paused') {
                $cronjob = updateJob(['status' => 'stopping']);
                // if ($cronjob['is_running']) {
                //     write_to_log_file("try to stop - sleep");
                //     sleep(5);
                // } else {
                //     write_to_log_file("try to stop - sleep");
                //     // write_to_log_file("ci_cronjob_do_cmd() " . $cmd . " status:" . $cronjob['status']);
                //     ci_update_products_action();
                // }
            }
            break;

        case 'upgrade':
            // update job object to reflect changes
            if (($cronjob['status'] === 'stopped' || $cronjob['status'] === 'idle') && (!isset($cronjob['version']) || $cronjob['version'] < $default_job['version'])) {
                $oldVersion = $cronjob['version'];
                $cronjob = updateJob($default_job, true);
                write_to_log_file('Job Upgraded to ' . $oldVersion . ' => ' . $cronjob['version']);
            }
            break;
    }
    return $cronjob;
}

// this is what react is calling to get updates and trigger commands
function ci_store_cronjob_api()
{
    // write_to_log_file("ci_store_cronjob_api()");
    global $default_job, $option_key;
    $cronjob = get_option($option_key, $default_job);
    if (!empty($_GET['cmd'])) {
        $cronjob = ci_cronjob_do_cmd($_GET['cmd']);
    }
    $next = wp_next_scheduled('ci_update_products');
    $cronjob['next'] = $next !== false ? date('c', $next) : $next;
    $cronjob['now'] = current_time('mysql', 1);
    wp_send_json($cronjob, null, JSON_PRETTY_PRINT);
}

add_action('wp_ajax_ci_store_cronjob_api', 'ci_store_cronjob_api');

function ci_store_api()
{
    // write_to_log_file("ci_store_cronjob_api()");

    if (!empty($_GET['cmd'])) {
        switch ($_GET['cmd']) {
            case 'getlog':
                $log = read_log_file();
                return wp_send_json($log, null, JSON_PRETTY_PRINT);
            case 'clearlog':
                clear_log_file();
        }
    }
    return null;
}

add_action('wp_ajax_ci_store_api', 'ci_store_api');

function XXdoTest()
{
    write_to_log_file("doTest()");
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

function updateJob($delta, $replace = false)
{
    global $default_job, $option_key;
    if ($replace) {
        update_option($option_key, $delta);
        $update = $delta;
    } else {
        $cronjob = get_option($option_key, $default_job);
        $update = array_merge($cronjob, $delta);
        update_option($option_key, $update);
    }
    write_to_log_file("updateJob() " . json_encode($delta));
    return $update;
}

// main function fired by the cron action
// if the job isn't running
function ci_update_products_action()
{
    $cronjob = getJob();
    write_to_log_file("ci_update_products_action() status:" . $cronjob['status']);

    switch ($cronjob['status']) {
        case 'starting':
            $cronjob = updateJob(['status' => 'started', 'loops' => 0]);
            ci_update_products_action();
            break;

        case 'started':
            // do_loop();
            do_action('do_loop');
            break;

        case 'pausing':
            if ($cronjob['is_running']) {
                write_to_log_file("pause attempt failed - is_running:" . $cronjob['is_running']);
                sleep(3);
                do_action('ci_update_products_action');
                // ci_update_products_action();
            } else {
                $cronjob = updateJob(['status' => 'paused', 'is_running' => false]);
                ci_update_products_action();
            }
            break;

        case 'paused':
            // $cronjob = updateJob(['status' => 'started']);
            break;

        case 'resuming':
            $cronjob = updateJob(['status' => 'started']);
            ci_update_products_action();
            break;

        case 'stopping':
            if ($cronjob['is_running']) {
                write_to_log_file("try to stop - sleep 5s");
                sleep(5);
                ci_update_products_action();
            } else {
                $cronjob = updateJob(['status' => 'stopped']);
                ci_update_products_action();
            }
            break;

        case 'stopped':
            // $cronjob = updateJob(['status' => 'started']);
            break;
    }

}

add_action('ci_update_products_action', 'ci_update_products_action');

// $loopRunning = false;

function do_loop()
{

    // global $loopRunning;
    // if ($loopRunning) {
    //     return;
    // }

    // $loopRunning = true;
    $cronjob = getJob();
    if ($cronjob['is_running']) {
        write_to_log_file("do_loop() skip already running");
        return;
    }
    write_to_log_file("do_loop() START status:" . $cronjob['status']);
    $cronjob = updateJob(['is_running' => true]);
    // $cronjob = updateJob(['status' => 'paused']);
    // $status = $cronjob['status'];
    sleep(10);
    $cronjob = getJob();
    $cronjob = updateJob(['is_running' => false, 'loops' => $cronjob['loops'] + 1]);
    write_to_log_file("do_loop() END 1 status:" . $cronjob['status']);
    // write_to_log_file("do_loop() status:" . $status . " is_running:" . $cronjob['is_running']);
    // $cronjob = updateJob(['loops' => $cronjob['loops'] + 1]);

    //
    ci_update_products_action();
    // $loopRunning = false;
    // return $status;
}

add_action('do_loop_action', 'do_loop');

function XXci_update_products_action()
{
    // cron job fires this
    // global $default_job, $option_key;
    $cronjob = getJob(); //get_option($option_key, $default_job);
    write_to_log_file("ci_update_products_action() is_running=" . $cronjob['is_running'] . " status:" . $cronjob['status']);

    // $cronjob['attempt_auto_start_success'] = false;

    if ($cronjob['is_running'] === false) {
        write_to_log_file("ci_update_products_action()");
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
    write_to_log_file("do_ci_update_products_action()");
    $cronjob = getJob(); //updateJob(['is_running' => true]);
    $status = $cronjob['status'];

    if ($status === 'paused') {
        return;
    }

    if ($status === 'stopping') {
        $cronjob = updateJob(['is_running' => false, 'status' => 'idle']);
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
        write_to_log_file("while loop");
        $status = $cronjob['status'];
    }
    write_to_log_file("escaped while");
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
