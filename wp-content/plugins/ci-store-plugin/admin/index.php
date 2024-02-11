<?php

require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/ReactSubpage.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/actions/ProductImporter.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/actions/StockCheck.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/LogFile.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/western/import_western_product.php';
require_once WP_PLUGIN_DIR . '/ci-store-plugin/admin/ci_import_product.php';

new ReactSubpage('overview', 'Overview', 'ci-store-plugin-page', 'ci-store_page_');

new ProductImporter();
new ReactSubpage('import_products', 'Import Products', 'ci-store-plugin-page', 'ci-store_page_');

$stock_check = new StockCheck();
$stock_check->schedule('every_day');
new ReactSubpage('stock_check', 'Stock Check', 'ci-store-plugin-page', 'ci-store_page_');

new ReactSubpage('manage_events', 'Manage Events', 'ci-store-plugin-page', 'ci-store_page_');

new ReactSubpage('manage_products', 'Manage Products', 'ci-store-plugin-page', 'ci-store_page_');

include_once WP_PLUGIN_DIR . '/ci-store-plugin/utils/get_crons.php';

function checkCleanCompletedScheduledEvents()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'actionscheduler_actions';
    $total_rows = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'complete'");
    return ['deleted' => $total_rows];

}

function cleanCompletedScheduledEvents()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'actionscheduler_actions';
    $rows_deleted = $wpdb->query("DELETE FROM $table_name WHERE status = 'complete'");
    return ['deleted' => $rows_deleted];
}

function handle_ajax_scheduled_events_api()
{
    global $wpdb;
    $cmd = isset($_GET['cmd']) ? $_GET['cmd'] : '';
    $filter = isset($_GET['filter']) ? $_GET['filter'] : '';

    switch ($cmd) {
        case 'info':
            $crons = get_crons($filter);
            wp_send_json(['data' => $crons]);
            break;

        case 'preclean':
            // DELETE FROM wp_actionscheduler_actions WHERE status = 'complete';
            // wp_send_json(cleanCompletedScheduledEvents());
            wp_send_json(checkCleanCompletedScheduledEvents());
            break;

        case 'clean':
            // DELETE FROM wp_actionscheduler_actions WHERE status = 'complete';
            // wp_send_json(cleanCompletedScheduledEvents());
            wp_send_json(cleanCompletedScheduledEvents());
            break;

        case 'all':
            $cron_events = _get_cron_array();
            wp_send_json(['data' => $cron_events]);
            break;

        case 'unschedule':
            $hook_name = isset($_GET['hook_name']) ? $_GET['hook_name'] : '';
            $hook_hash = isset($_GET['hook_hash']) ? $_GET['hook_hash'] : '';
            $hook_timestamp = isset($_GET['hook_timestamp']) ? $_GET['hook_timestamp'] : '';
            $hook_args = isset($_GET['hook_args']) ? json_decode($_GET['hook_args']) : [];

            if ($hook_name) {
                if ($hook_hash) {
                    // $unscheduled = wp_unschedule_event(wp_next_scheduled($hook_name, ['identifier' => $hook_hash]), $hook_name, ['identifier' => $hook_hash]);
                    $unscheduled = wp_unschedule_event($hook_timestamp, $hook_name, $hook_args);

                    if ($unscheduled) {
                        wp_send_json(['message' => 'Scheduled event unscheduled successfully.']);
                    } else {
                        wp_send_json(['error' => 'Error unscheduling the event ' . $hook_name . ' with timestamp ' . $hook_timestamp]);
                    }
                } else {
                    // Clear all scheduled events for the specified hook
                    $cleared = wp_clear_scheduled_hook($hook_name);

                    if ($cleared) {
                        wp_send_json(['message' => 'All scheduled events with the hook name ' . $hook_name . ' cleared successfully.']);
                    } else {
                        wp_send_json(['error' => 'No scheduled events found for the hook name ' . $hook_name . '.']);
                    }

                }
            } else {
                wp_send_json(['error' => 'Not enough info.']);
            }
            break;

        case 'schedule':
            $hook_name = isset($_GET['hook_name']) ? $_GET['hook_name'] : '';
            $hook_args = isset($_GET['hook_args']) ? json_decode($_GET['hook_args']) : [];

            if ($hook_name && $hook_args) {
                wp_schedule_single_event(time() + 1, $hook_name, $hook_args);
            }
            $crons = get_crons($filter);
            wp_send_json(['data' => $crons]);
            break;

        default:
            $crons = get_crons($filter);
            wp_send_json(['data' => $crons]);
    }
    wp_die();
}

add_action('wp_ajax_scheduled_events_api', 'handle_ajax_scheduled_events_api');

function handle_ajax_ci_manager_api()
{
    $cmd = isset($_GET['cmd']) ? $_GET['cmd'] : '';
    $filter = isset($_GET['filter']) ? $_GET['filter'] : '';

    switch ($cmd) {
        case 'armageddon':
            $result = null;//process_products_batch();
            wp_send_json(['data' => $result]);
            break;
        default:
            wp_send_json(['error' => 'no cmd']);
    }

}

add_action('wp_ajax_ci_manager_api', 'handle_ajax_ci_manager_api');

function process_products_batch($offset = 0, $batch_size = 100, $result = ['products' => 0])
{
    $args = array(
        'post_type' => 'product',
        'posts_per_page' => $batch_size,
        'offset' => $offset,
    );
    error_log(json_encode($args));

    $products_query = new WP_Query($args);

    // Loop through and delete each product
    if ($products_query->have_posts()) {
        while ($products_query->have_posts()) {
            $products_query->the_post();
            $product_id = get_the_ID();
            $result['products']++;

            // Delete the product
            wp_delete_post($product_id, true);

            // Optionally, you can also delete the product's associated data using WooCommerce functions
            wc_delete_product_transients($product_id);
            delete_transient('wc_product_count_' . $product_id);
        }

        // Reset the post data
        wp_reset_postdata();

        // Recursive call to process the next batch
        return process_products_batch($offset + $batch_size, $batch_size, $result);
    } else {
        // echo 'All WooCommerce products deleted successfully.';
        return $result;
    }
}
