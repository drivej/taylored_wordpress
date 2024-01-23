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

function clear_completed_scheduled_actions() {
    // Specify the hook for your scheduled actions
    // $hook = 'woocommerce_run_product_attribute_lookup_update_callback';

    // // Get all scheduled events for the specified hook
    // $scheduled_events = wp_get_schedule($hook);

    // // Loop through each scheduled event and clear it
    // if ($scheduled_events) {
    //     foreach ($scheduled_events as $timestamp => $event) {
    //         // Check if the scheduled event is completed (in the past)
    //         if ($timestamp < time()) {
    //             // Clear the scheduled event
    //             wp_unschedule_event($timestamp, $hook);
    //         }
    //     }
    // }
}

// Call the function when needed
// clear_completed_scheduled_actions();