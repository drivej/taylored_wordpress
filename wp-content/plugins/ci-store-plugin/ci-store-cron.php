<?php

$option_key = 'ci_update_products_schedule_status';
$default_status = array('status' => 'none', 'started' => null, 'updated' => null, 'products' => 0, 'cursor' => '');

// init product scheduler

function schedule_product_update()
{
    global $default_status, $option_key;
    if (!wp_next_scheduled('ci_update_products')) {
        update_option($option_key, $default_status);
        wp_schedule_event(time(), 'every_minute', 'ci_update_products');
    }
}

add_action('wp', 'schedule_product_update');

// open endpoint to get update status

function ci_cron_status()
{
    global $option_key;
    $status = get_option($option_key, array());
    $next = wp_next_scheduled('ci_update_products');
    wp_send_json(['data' => $status, 'meta' => ['next' => $next]]);
}

add_action('wp_ajax_ci_cron_status', 'ci_cron_status');

// import action

function ci_update_products_action()
{
    global $default_status, $option_key;
    $status = get_option($option_key, $default_status);

    if ($status['status'] === 'running') {
        $status['status'] = 'stacked';
        update_option($option_key, $status);
        return;
    }

    $status['started'] = current_time('mysql');
    $status['status'] = 'running';
    update_option($option_key, $status);

    for ($i = 0; $i < 30; $i++) {
        $status['products'] += 4;
        $status['updated'] = current_time('mysql');
        update_option($option_key, $status);
        sleep(3);
    }
    $status['status'] = 'completed';
    $status['completed'] = current_time('mysql');
    update_option($option_key, $status);
}

add_action('ci_update_products', 'ci_update_products_action');
