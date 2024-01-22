<?php

include_once __DIR__ . '/product_admin.php';

function import_products_trigger()
{
    // Your tasks to be executed on schedule
    // For example, update some data, send emails, etc.
    error_log('Scheduled action executed!');
}

register_activation_hook(__FILE__, 'schedule_import_products');

function schedule_import_products()
{
    // Schedule the event to run hourly
    if (!wp_next_scheduled('import_products_event')) {
        // wp_schedule_event(time(), 'hourly', 'import_products_event');
        wp_schedule_event(time(), 'every_minute', 'import_products_event');
    }
}

add_action('import_products_event', 'import_products_trigger');
